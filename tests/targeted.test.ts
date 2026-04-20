import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { countWords, escapeXml, plainTextToChapterContent } from "../client/src/lib/chapter";
import { sanitizeContent } from "../client/src/lib/content/sanitize";
import { validateFetchUrl } from "../client/src/lib/fetch/chapterFetch";
import { getCanonicalUrl, seoRoutes } from "../client/src/lib/seo";

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

function testPrerenderOutput() {
  for (const route of Object.values(seoRoutes)) {
    const html = readRouteHtml(route.path);
    const canonicalUrl = getCanonicalUrl(route);
    const jsonLdCount = countMatches(html, /data-route-json-ld="true"/g);

    assert.match(html, new RegExp(`<title>${escapeRegExp(route.title)}</title>`));
    assert.equal(countMatches(html, /rel="canonical"/g), 1);
    assert.match(html, new RegExp(`property="og:url" content="${escapeRegExp(canonicalUrl)}"`));
    assert.equal(jsonLdCount, route.jsonLd ? 1 : 0);
    assert.match(html, /<div id="root">[\s\S]*[A-Za-z][\s\S]*<\/div>/);

    if (route.path.startsWith("/guides/")) {
      assert.match(html, /Guide/);
      assert.match(html, /Related guides/);
    }
  }
}

function testSitemapMatchesSeoRegistry() {
  const sitemap = fs.readFileSync(path.join(repoRoot, "dist/public/sitemap.xml"), "utf8");
  const urls = Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1]);
  const routeUrls = Object.values(seoRoutes).map(getCanonicalUrl);

  assert.deepEqual(urls.sort(), routeUrls.sort());
}

testChapterHelpers();
testSanitizerFallback();
testFetchUrlValidation();
testPrerenderOutput();
testSitemapMatchesSeoRegistry();

console.log("Targeted tests passed.");
