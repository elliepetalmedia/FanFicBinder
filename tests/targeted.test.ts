import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { countWords, escapeXml, plainTextToChapterContent } from "../client/src/lib/chapter";
import { buildConverterHandoffUrl, parseConverterHandoff } from "../client/src/lib/converterHandoff";
import {
  appendUniqueChapter,
  BINDER_DEFAULTS,
  clearBinderSnapshot,
  collectSourceUrls,
  deserializeBinder,
  getRemainingChapters,
  isPersistenceAvailable,
  loadBinderSnapshot,
  saveBinderSnapshot,
  serializeBinder,
} from "../client/src/lib/persistence/binderStore";
import { sanitizeContent } from "../client/src/lib/content/sanitize";
import { validateFetchUrl } from "../client/src/lib/fetch/chapterFetch";
import {
  fetchAo3WorkManifest,
  importAo3WorkChapters,
  isRetryableImportError,
} from "../client/src/lib/importer/workImporter";
import {
  detectAo3AccessGate,
  isAo3WorkUrl,
  normalizeAo3WorkUrl,
  parseAo3Chapter,
  parseAo3Manifest,
  parseAo3Metadata,
  parseAo3WorkId,
} from "../client/src/lib/sources/ao3";
import { getAdapterForUrl, supportsWholeWork } from "../client/src/lib/sources/index";
import {
  buildLlmsFullTxt,
  buildLlmsTxt,
  buildRobotsTxt,
  getCanonicalUrl,
  seoRoutes,
} from "../client/src/lib/seo";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function testChapterHelpers() {
  assert.equal(countWords("  one two\nthree  "), 3);
  assert.equal(countWords(""), 0);
  assert.equal(escapeXml(`<tag attr="x">&'`), "&lt;tag attr=&quot;x&quot;&gt;&amp;&apos;");
  assert.equal(
    plainTextToChapterContent("First paragraph\n\n<script>alert(1)</script>"),
    "<p>First paragraph</p><p>&lt;script&gt;alert(1)&lt;/script&gt;</p>",
  );
}

function testSanitizerFallback() {
  const sanitized = sanitizeContent(`<p onclick="bad()">Safe</p><script>alert(1)</script>`);

  assert.match(sanitized, /Safe/);
  assert.doesNotMatch(sanitized, /script/i);
  assert.doesNotMatch(sanitized, /onclick/i);
}

function testFetchUrlValidation() {
  assert.equal(validateFetchUrl("https://example.com/path").hostname, "example.com");
  assert.throws(() => validateFetchUrl("ftp://example.com"), /Only HTTP and HTTPS/);
  assert.throws(() => validateFetchUrl("not a url"), /valid URL/);
}

function readFixture(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, "tests", "fixtures", relativePath), "utf8");
}

function testAo3UrlRecognition() {
  assert.equal(isAo3WorkUrl("https://archiveofourown.org/works/12345"), true);
  assert.equal(isAo3WorkUrl("https://archiveofourown.org/works/12345?view_full_work=true"), true);
  assert.equal(isAo3WorkUrl("https://archiveofourown.org/works/12345/chapters/67890"), true);
  assert.equal(isAo3WorkUrl("http://archiveofourown.org/works/12345/chapters/67890#main"), true);
  assert.equal(isAo3WorkUrl("https://archiveofourown.org/users/someone"), false);
  assert.equal(isAo3WorkUrl("https://archiveofourown.org/tags/SomeTag"), false);
  assert.equal(isAo3WorkUrl("https://example.com/works/12345"), false);
  assert.equal(isAo3WorkUrl("https://archiveofourown.evil.com/works/12345"), false);
  assert.equal(isAo3WorkUrl("not a url"), false);
  assert.equal(parseAo3WorkId("https://archiveofourown.org/works/12345/chapters/67890"), "12345");
  assert.equal(parseAo3WorkId("https://example.com/nope"), null);
}

function testAo3Normalization() {
  assert.equal(
    normalizeAo3WorkUrl("https://archiveofourown.org/works/12345/chapters/67890"),
    "https://archiveofourown.org/works/12345",
  );
  assert.equal(
    normalizeAo3WorkUrl("https://archiveofourown.org/works/12345?view_full_work=true#main"),
    "https://archiveofourown.org/works/12345",
  );
  assert.equal(
    normalizeAo3WorkUrl("https://archiveofourown.org/works/12345"),
    "https://archiveofourown.org/works/12345",
  );
  assert.throws(() => normalizeAo3WorkUrl("https://example.com/works/123"), /AO3 work URL/);
  assert.throws(() => normalizeAo3WorkUrl("https://archiveofourown.org/users/foo"), /AO3 work URL/);
}

function testAo3Metadata() {
  const meta = parseAo3Metadata(readFixture("ao3/work.html"));
  assert.equal(meta?.title, "The Starlit Binder");
  assert.equal(meta?.author, "TestAuthor");
  assert.equal(parseAo3Metadata(readFixture("ao3/malformed.html")), null);
  assert.equal(parseAo3Metadata(""), null);
}

function testAo3Manifest() {
  const manifest = parseAo3Manifest(readFixture("ao3/work.html"), "https://archiveofourown.org/works/12345");
  assert.ok(manifest);
  assert.equal(manifest.metadata.title, "The Starlit Binder");
  assert.equal(manifest.metadata.author, "TestAuthor");
  assert.equal(manifest.metadata.workId, "12345");
  assert.equal(manifest.chapters.length, 3);
  assert.deepEqual(
    manifest.chapters.map((c) => c.url),
    [
      "https://archiveofourown.org/works/12345/chapters/11111",
      "https://archiveofourown.org/works/12345/chapters/22222",
      "https://archiveofourown.org/works/12345/chapters/33333",
    ],
  );
  assert.deepEqual(
    manifest.chapters.map((c) => c.title),
    ["Chapter One: Beginnings", "Chapter Two: Middles", "Chapter Three: Endings"],
  );
  assert.deepEqual(
    manifest.chapters.map((c) => c.order),
    [1, 2, 3],
  );
  // Chapters listed twice (index + dropdown) must be deduped, not doubled.
  assert.equal(new Set(manifest.chapters.map((c) => c.id)).size, 3);
  assert.equal(parseAo3Manifest(readFixture("ao3/malformed.html"), "https://archiveofourown.org/works/12345"), null);
}

function testAo3ChapterExtraction() {
  const chapter = parseAo3Chapter(readFixture("ao3/chapter1.html"));
  assert.ok(chapter);
  assert.equal(chapter.title, "Chapter One: Beginnings");
  assert.match(chapter.content, /First light over the archive/);
  assert.match(chapter.content, /Second paragraph/);

  const single = parseAo3Chapter(readFixture("ao3/single-chapter.html"));
  assert.ok(single);
  assert.equal(single.title, "Only Chapter");

  assert.equal(parseAo3Chapter(readFixture("ao3/malformed.html")), null);
  assert.equal(parseAo3Chapter(""), null);
  assert.equal(detectAo3AccessGate(readFixture("ao3/gated-login.html")), "login-required");
  assert.equal(detectAo3AccessGate(readFixture("ao3/chapter1.html")), null);
}

function testAdapterRouting() {
  assert.equal(getAdapterForUrl("https://archiveofourown.org/works/12345").id, "ao3");
  assert.equal(getAdapterForUrl("https://archiveofourown.org/works/12345/chapters/1").id, "ao3");
  assert.equal(getAdapterForUrl("https://example.com/story/1").id, "generic");
  assert.equal(getAdapterForUrl("https://www.royalroad.com/fiction/1/x/chapter/2").id, "generic");
  assert.equal(supportsWholeWork("https://archiveofourown.org/works/12345"), true);
  assert.equal(supportsWholeWork("https://example.com/story/1"), false);
  assert.equal(isRetryableImportError(new Error("HTTP 429")), true);
  assert.equal(isRetryableImportError(new Error("HTTP 503")), true);
  assert.equal(isRetryableImportError(new Error("Work not found")), false);
}

async function testAo3Importer() {
  const workHtml = readFixture("ao3/work.html");
  const pages: Record<string, string> = {
    "https://archiveofourown.org/works/12345": workHtml,
    "https://archiveofourown.org/works/12345/chapters/11111": readFixture("ao3/chapter1.html"),
    "https://archiveofourown.org/works/12345/chapters/22222": readFixture("ao3/chapter2.html"),
    "https://archiveofourown.org/works/12345/chapters/33333": readFixture("ao3/chapter3.html"),
  };
  const fetchHtml = async (url: string) => {
    const page = pages[url];
    if (!page) throw new Error(`HTTP 404 for ${url}`);
    return page;
  };

  const manifest = await fetchAo3WorkManifest("https://archiveofourown.org/works/12345/chapters/22222", fetchHtml);
  assert.equal(manifest.chapters.length, 3);
  assert.equal(manifest.metadata.title, "The Starlit Binder");

  // Full import, sequential and in order.
  const order: string[] = [];
  const trackingFetch = async (url: string) => {
    order.push(url);
    return fetchHtml(url);
  };
  const outcome = await importAo3WorkChapters(manifest, trackingFetch, { delayMs: 0 });
  assert.equal(outcome.cancelled, false);
  assert.equal(outcome.failed.length, 0);
  assert.equal(outcome.imported.length, 3);
  assert.deepEqual(order, manifest.chapters.map((c) => c.url));
  assert.equal(outcome.imported[0].title, "Chapter One: Beginnings");

  // Resume: already-imported URLs are skipped, never duplicated.
  const resume = await importAo3WorkChapters(manifest, trackingFetch, {
    delayMs: 0,
    existingUrls: new Set(outcome.imported.map((c) => c.sourceUrl)),
  });
  assert.equal(resume.imported.length, 0);
  assert.equal(resume.failed.length, 0);

  // Retry: a transient 429 on chapter 2 succeeds on the second attempt,
  // and chapters 1 + 3 are preserved.
  let chapter2Attempts = 0;
  const flakyFetch = async (url: string) => {
    if (url.endsWith("/chapters/22222")) {
      chapter2Attempts++;
      if (chapter2Attempts === 1) throw new Error("HTTP 429 Too Many Requests");
    }
    return fetchHtml(url);
  };
  const retried = await importAo3WorkChapters(manifest, flakyFetch, { delayMs: 0 });
  assert.equal(chapter2Attempts, 2);
  assert.equal(retried.imported.length, 3);
  assert.equal(retried.failed.length, 0);

  // Permanent failure preserves the chapters that did succeed.
  const failingFetch = async (url: string) => {
    if (url.endsWith("/chapters/22222")) throw new Error("HTTP 500 Server Error");
    return fetchHtml(url);
  };
  const partial = await importAo3WorkChapters(manifest, failingFetch, { delayMs: 0 });
  assert.equal(partial.imported.length, 2);
  assert.equal(partial.failed.length, 1);
  assert.equal(partial.failed[0].url, "https://archiveofourown.org/works/12345/chapters/22222");

  // Cancellation keeps already-imported chapters and stops further fetches.
  const controller = new AbortController();
  let fetchCount = 0;
  const cancellableFetch = async (url: string) => {
    fetchCount++;
    controller.abort();
    return fetchHtml(url);
  };
  const cancelled = await importAo3WorkChapters(manifest, cancellableFetch, {
    delayMs: 0,
    signal: controller.signal,
  });
  assert.equal(cancelled.cancelled, true);
  assert.ok(fetchCount <= 1);

  // Restricted works surface an actionable error without network guessing.
  await assert.rejects(
    fetchAo3WorkManifest("https://archiveofourown.org/works/999", async () => readFixture("ao3/gated-login.html")),
    /login|restricted|publicly accessible/i,
  );
  await assert.rejects(
    fetchAo3WorkManifest("https://archiveofourown.org/works/999", async () => readFixture("ao3/malformed.html")),
    /No chapter list/i,
  );
}

function readRouteHtml(routePath: string): string {
  const filePath = routePath === "/" ? "dist/public/index.html" : `dist/public${routePath}/index.html`;
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

function countMatches(value: string, pattern: RegExp): number {
  return value.match(pattern)?.length ?? 0;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countHeadings(html: string, level: number): number {
  return html.match(new RegExp(`<h${level}[\\s>]`, "g"))?.length ?? 0;
}

function testHomeHeadingSemantics() {
  const homeHtml = readRouteHtml("/");
  const h1Matches = Array.from(homeHtml.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g));

  // Exactly one primary H1 on the homepage.
  assert.equal(h1Matches.length, 1);
  assert.match(
    h1Matches[0][1].replace(/<[^>]*>/g, "").trim(),
    /Convert Fanfiction (&amp;|&) Web Fiction to EPUB/,
  );

  // The header brand must not consume the H1.
  assert.doesNotMatch(homeHtml, /<h1[^>]*>[\s\S]*?FanFic[\s\S]*?Binder[\s\S]*?<\/h1>/);

  // Hero copy covers the conversion workflow and local generation.
  assert.match(homeHtml, /Paste a story or chapter URL/);
  assert.match(homeHtml, /Kindle, Kobo, Apple Books/);
  assert.match(homeHtml, /generated locally on your device/);

  // Capability indicators stay near the URL entry.
  assert.match(homeHtml, /AO3 whole-work import/);
  assert.match(homeHtml, /Manual entry when a source blocks fetching/);
  assert.match(homeHtml, /No account required/);

  // Guide pages keep their own single H1 after the header change.
  const guideHtml = readRouteHtml(seoRoutes.ao3ToEpub.path);
  assert.equal(countHeadings(guideHtml, 1), 1);
  assert.match(guideHtml, /<h1[^>]*>[\s\S]*?AO3 to EPUB Workflow[\s\S]*?<\/h1>/);
}

function testConverterHandoff() {
  const workUrl = "https://archiveofourown.org/works/12345/chapters/67890";
  assert.equal(buildConverterHandoffUrl(workUrl), `/?url=${encodeURIComponent(workUrl)}`);

  const tricky = "https://example.com/a?b=c&d=e#frag";
  assert.equal(parseConverterHandoff(`?url=${encodeURIComponent(tricky)}`), new URL(tricky).toString());
  assert.equal(parseConverterHandoff(buildConverterHandoffUrl(workUrl).slice(1)), workUrl);

  assert.equal(parseConverterHandoff(""), null);
  assert.equal(parseConverterHandoff("?other=1"), null);
  assert.equal(parseConverterHandoff("?url=not%20a%20url"), null);
  assert.equal(parseConverterHandoff(`?url=${encodeURIComponent("ftp://example.com/x")}`), null);

  assert.throws(() => buildConverterHandoffUrl("ftp://example.com/x"), /http/);
  assert.throws(() => buildConverterHandoffUrl("not a url"), /http/);
  assert.throws(() => buildConverterHandoffUrl(""), /http/);
}

function testGuideConverterCtas() {
  const converterPaths = [
    seoRoutes.ao3ToEpub.path,
    seoRoutes.fanfictionToEpub.path,
    seoRoutes.webFictionToEpub.path,
    seoRoutes.saveWebFictionForEreader.path,
    seoRoutes.sendEpubToKindle.path,
    seoRoutes.epubToEreader.path,
  ];

  for (const routePath of converterPaths) {
    const html = readRouteHtml(routePath);
    assert.equal(countHeadings(html, 1), 1, `expected a single H1 on ${routePath}`);
    assert.match(html, /data-url-entry-cta="true"/);
    assert.match(html, /Continue in the Binder/);
  }

  const ao3Html = readRouteHtml(seoRoutes.ao3ToEpub.path);
  assert.match(ao3Html, /preview the detected/i);
  assert.match(ao3Html, /import the whole work in reading order/i);
  assert.match(ao3Html, /Manual Entry/);
}

function testBinderSerialization() {
  const coverBytes = new TextEncoder().encode("fake-cover-bytes").buffer;
  const manifest = parseAo3Manifest(readFixture("ao3/work.html"), "https://archiveofourown.org/works/12345");
  assert.ok(manifest);

  const snapshot = serializeBinder({
    bookTitle: "Restored Binder",
    authorName: "Restored Author",
    font: "sans",
    spacing: "1.8",
    dropCaps: true,
    outputFormat: "reader",
    coverImage: coverBytes,
    coverMimeType: "image/png",
    chapters: [
      { id: "a", title: "One", content: "<p>One</p>", wordCount: 1, sourceUrl: manifest.chapters[0].url },
      { id: "b", title: "Two", content: "<p>Two</p>", wordCount: 1, sourceUrl: manifest.chapters[1].url },
    ],
    ao3Import: { workUrl: manifest.metadata.sourceUrl, manifest, status: "in-progress" },
  });

  assert.equal(snapshot.version, 1);

  // Plain-data fields survive a JSON round-trip; the cover ArrayBuffer is
  // restored alongside because JSON cannot carry binary data.
  const roundTripped = {
    ...JSON.parse(JSON.stringify(snapshot)),
    cover: { data: coverBytes, mimeType: "image/png" },
  };
  const { snapshot: restored, newerVersion } = deserializeBinder(roundTripped);
  assert.equal(newerVersion, false);
  assert.ok(restored);
  assert.equal(restored.bookTitle, "Restored Binder");
  assert.equal(restored.authorName, "Restored Author");
  assert.equal(restored.font, "sans");
  assert.equal(restored.outputFormat, "reader");
  assert.equal(restored.dropCaps, true);
  assert.equal(restored.chapters.length, 2);
  assert.equal(restored.chapters[0].sourceUrl, manifest.chapters[0].url);
  assert.equal(restored.cover?.mimeType, "image/png");
  assert.equal(restored.cover?.data.byteLength, coverBytes.byteLength);
  assert.equal(restored.ao3Import?.manifest.chapters.length, 3);
}

function testBinderMigration() {
  // Newer schema versions are reported, never silently adopted.
  const newer = deserializeBinder({ version: 999, chapters: [] });
  assert.equal(newer.snapshot, null);
  assert.equal(newer.newerVersion, true);

  // Garbage and non-objects restore to nothing without throwing.
  for (const garbage of [null, undefined, "", "garbage", 42, [], true]) {
    const result = deserializeBinder(garbage);
    assert.equal(result.snapshot, null);
    assert.equal(result.newerVersion, false);
  }

  // Incomplete state heals to safe defaults.
  const incomplete = deserializeBinder({ version: 1 });
  assert.equal(incomplete.newerVersion, false);
  assert.ok(incomplete.snapshot);
  assert.equal(incomplete.snapshot.bookTitle, BINDER_DEFAULTS.bookTitle);
  assert.equal(incomplete.snapshot.authorName, BINDER_DEFAULTS.authorName);
  assert.equal(incomplete.snapshot.outputFormat, "epub");
  assert.equal(incomplete.snapshot.chapters.length, 0);
  assert.equal(incomplete.snapshot.cover, null);
  assert.equal(incomplete.snapshot.ao3Import, null);

  // Invalid chapters are dropped; valid ones survive; bad enums fall back.
  const mixed = deserializeBinder({
    version: 1,
    outputFormat: "pdf",
    dropCaps: "yes",
    chapters: [
      { id: "ok", title: "Kept", content: "<p>x</p>", wordCount: 1 },
      { id: "bad-title", title: 42, content: "<p>x</p>" },
      { id: "bad-content", title: "Nope" },
      null,
    ],
  });
  assert.ok(mixed.snapshot);
  assert.equal(mixed.snapshot.outputFormat, "epub");
  assert.equal(mixed.snapshot.dropCaps, false);
  assert.equal(mixed.snapshot.chapters.length, 1);
  assert.equal(mixed.snapshot.chapters[0].title, "Kept");

  // Legacy state without a version marker is still honored leniently.
  const legacy = deserializeBinder({
    bookTitle: "Legacy",
    chapters: [{ id: "l", title: "Old", content: "<p>old</p>", wordCount: 1 }],
  });
  assert.ok(legacy.snapshot);
  assert.equal(legacy.snapshot.bookTitle, "Legacy");
  assert.equal(legacy.snapshot.chapters.length, 1);
}

function testBinderDedupe() {
  const first = appendUniqueChapter([], {
    title: "One",
    content: "<p>1</p>",
    wordCount: 1,
    sourceUrl: "https://archiveofourown.org/works/12345/chapters/11111",
  });
  assert.equal(first.added, true);

  const duplicate = appendUniqueChapter(first.chapters, {
    title: "One (again)",
    content: "<p>1</p>",
    wordCount: 1,
    sourceUrl: "https://archiveofourown.org/works/12345/chapters/11111",
  });
  assert.equal(duplicate.added, false);
  assert.equal(duplicate.chapters.length, 1);

  // Manual entries without a source URL always append.
  const manual = appendUniqueChapter(duplicate.chapters, { title: "Note", content: "<p>n</p>", wordCount: 1 });
  assert.equal(manual.added, true);
  assert.equal(manual.chapters.length, 2);

  assert.deepEqual(
    Array.from(collectSourceUrls(manual.chapters)),
    ["https://archiveofourown.org/works/12345/chapters/11111"],
  );
}

async function testInterruptedImportResume() {
  const manifest = parseAo3Manifest(readFixture("ao3/work.html"), "https://archiveofourown.org/works/12345");
  assert.ok(manifest);

  // Simulate a crash after 2 of 3 chapters: binder holds the completed ones.
  let chapters = appendUniqueChapter([], {
    title: manifest.chapters[0].title,
    content: "<p>c1</p>",
    wordCount: 1,
    sourceUrl: manifest.chapters[0].url,
  }).chapters;
  chapters = appendUniqueChapter(chapters, {
    title: manifest.chapters[1].title,
    content: "<p>c2</p>",
    wordCount: 1,
    sourceUrl: manifest.chapters[1].url,
  }).chapters;

  const persisted = serializeBinder({
    bookTitle: BINDER_DEFAULTS.bookTitle,
    authorName: BINDER_DEFAULTS.authorName,
    font: BINDER_DEFAULTS.font,
    spacing: BINDER_DEFAULTS.spacing,
    dropCaps: BINDER_DEFAULTS.dropCaps,
    outputFormat: BINDER_DEFAULTS.outputFormat,
    coverImage: null,
    coverMimeType: "image/jpeg",
    chapters,
    ao3Import: { workUrl: manifest.metadata.sourceUrl, manifest, status: "in-progress" },
  });
  const { snapshot } = deserializeBinder(persisted);
  assert.ok(snapshot?.ao3Import);

  // Resume fetches only the missing chapter, in manifest order, without dupes.
  const remaining = getRemainingChapters(snapshot.ao3Import.manifest, collectSourceUrls(snapshot.chapters));
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].url, manifest.chapters[2].url);

  // End-to-end through the importer with an injected fixture fetch: the two
  // completed chapters are skipped, the missing one arrives via onChapter.
  const pages: Record<string, string> = {
    "https://archiveofourown.org/works/12345/chapters/11111": readFixture("ao3/chapter1.html"),
    "https://archiveofourown.org/works/12345/chapters/22222": readFixture("ao3/chapter2.html"),
    "https://archiveofourown.org/works/12345/chapters/33333": readFixture("ao3/chapter3.html"),
  };
  const arrived: string[] = [];
  let live = [...snapshot.chapters];
  const outcome = await importAo3WorkChapters(snapshot.ao3Import.manifest, async (url) => {
    const page = pages[url];
    if (!page) throw new Error(`HTTP 404 for ${url}`);
    return page;
  }, {
    delayMs: 0,
    existingUrls: collectSourceUrls(snapshot.chapters),
    onChapter: (item) => {
      arrived.push(item.sourceUrl);
      live = appendUniqueChapter(live, { ...item, wordCount: 1 }).chapters;
    },
  });

  assert.equal(outcome.failed.length, 0);
  assert.deepEqual(arrived, [manifest.chapters[2].url]);
  assert.equal(live.length, 3);
  assert.deepEqual(getRemainingChapters(manifest, collectSourceUrls(live)), []);
}

async function testPersistenceUnavailableFallback() {
  // Node has no IndexedDB: the wrapper must report unavailability instead of
  // throwing, which is the contract Home's nonfatal fallback relies on.
  assert.equal(isPersistenceAvailable(), false);

  const draft = {
    bookTitle: "x",
    authorName: "y",
    font: "serif",
    spacing: "1.6",
    dropCaps: false as boolean,
    outputFormat: "epub" as const,
    coverImage: null,
    coverMimeType: "image/jpeg",
    chapters: [],
    ao3Import: null,
  };
  const saved = await saveBinderSnapshot(serializeBinder(draft));
  assert.equal(saved.ok, false);
  assert.match(saved.ok === false ? saved.reason : "", /unavailable/i);

  const loaded = await loadBinderSnapshot();
  assert.equal(loaded.ok, false);

  const cleared = await clearBinderSnapshot();
  assert.equal(cleared.ok, false);
}

function testPrerenderOutput() {
  for (const route of Object.values(seoRoutes)) {
    const html = readRouteHtml(route.path);
    const canonicalUrl = getCanonicalUrl(route);
    const jsonLdCount = countMatches(html, /data-route-json-ld="true"/g);

    assert.match(html, new RegExp(`<title>${escapeRegExp(route.title)}</title>`));
    assert.equal(countMatches(html, /rel="canonical"/g), 1);
    assert.match(html, new RegExp(`property="og:url" content="${escapeRegExp(canonicalUrl)}"`));
    assert.equal(jsonLdCount, 1);
    assert.match(html, /<div id="root">[\s\S]*[A-Za-z][\s\S]*<\/div>/);

    if (route.path !== "/") {
      assert.match(html, /Last updated/);
    }

    if (route.path.startsWith("/guides")) {
      assert.match(html, /Breadcrumb/);
      assert.match(html, /Related guides/);
    }
  }
}

function testSitemapMatchesSeoRegistry() {
  const sitemap = fs.readFileSync(path.join(repoRoot, "dist/public/sitemap.xml"), "utf8");
  const urls = Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1]);
  const lastmods = Array.from(sitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g)).map((match) => match[1]);
  const routeUrls = Object.values(seoRoutes).map(getCanonicalUrl);

  assert.deepEqual(urls.sort(), routeUrls.sort());
  assert.equal(lastmods.length, routeUrls.length);
}

function testCrawlerArtifacts() {
  const robots = fs.readFileSync(path.join(repoRoot, "dist/public/robots.txt"), "utf8");
  const llms = fs.readFileSync(path.join(repoRoot, "dist/public/llms.txt"), "utf8");
  const llmsFull = fs.readFileSync(path.join(repoRoot, "dist/public/llms-full.txt"), "utf8");

  assert.equal(robots, buildRobotsTxt());
  assert.equal(llms, buildLlmsTxt());
  assert.equal(llmsFull, buildLlmsFullTxt());
  assert.match(robots, /LLM-Guide/);
  assert.match(llms, /Preferred citation pages/);
  assert.match(llmsFull, /Indexable routes/);
}

testChapterHelpers();
testSanitizerFallback();
testFetchUrlValidation();
testAo3UrlRecognition();
testAo3Normalization();
testAo3Metadata();
testAo3Manifest();
testAo3ChapterExtraction();
testAdapterRouting();
await testAo3Importer();
testBinderSerialization();
testBinderMigration();
testBinderDedupe();
await testInterruptedImportResume();
await testPersistenceUnavailableFallback();
testConverterHandoff();
testGuideConverterCtas();
testHomeHeadingSemantics();
testPrerenderOutput();
testSitemapMatchesSeoRegistry();
testCrawlerArtifacts();

console.log("Targeted tests passed.");
