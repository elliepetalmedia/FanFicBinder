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

function testPrerenderOutput() {
  for (const route of Object.values(seoRoutes)) {
    const html = readRouteHtml(route.path);
    const canonicalUrl = getCanonicalUrl(route);

    assert.match(html, new RegExp(`<title>${route.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</title>`));
    assert.equal(countMatches(html, /rel="canonical"/g), 1);
    assert.match(html, new RegExp(`property="og:url" content="${canonicalUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
    assert.match(html, /<div id="root">[\s\S]+<\/div>/);
  }
}

testChapterHelpers();
testSanitizerFallback();
testFetchUrlValidation();
testPrerenderOutput();

console.log("Targeted tests passed.");
