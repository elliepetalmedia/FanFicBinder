import fs from "node:fs/promises";
import path from "node:path";
import { renderToString } from "react-dom/server";
import { PrerenderApp } from "./PrerenderApp";
import {
  DEFAULT_OG_IMAGE,
  buildSitemapXml,
  getCanonicalUrl,
  getSeoJsonLd,
  seoRouteList,
  type SeoRoute,
} from "@/lib/seo";

const rootDir = process.cwd();
const publicDir = path.resolve(rootDir, "dist", "public");
const templatePath = path.join(publicDir, "index.html");

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function replaceOrInsertHeadTag(html: string, pattern: RegExp, replacement: string): string {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }

  return html.replace("</head>", `    ${replacement}\n  </head>`);
}

function applyRouteHead(html: string, route: SeoRoute): string {
  const canonicalUrl = getCanonicalUrl(route);
  const jsonLd = getSeoJsonLd(route);
  const jsonLdMarkup = jsonLd.length > 0
    ? `    <script type="application/ld+json" data-route-json-ld="true">${JSON.stringify(jsonLd.length === 1 ? jsonLd[0] : jsonLd)}</script>\n`
    : "";

  let next = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
    .replace(/\s*<script type="application\/ld\+json"[\s\S]*?<\/script>\s*/g, "\n");

  next = replaceOrInsertHeadTag(
    next,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(route.description)}" />`,
  );
  next = replaceOrInsertHeadTag(
    next,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`,
  );
  next = replaceOrInsertHeadTag(
    next,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${escapeHtml(route.title)}" />`,
  );
  next = replaceOrInsertHeadTag(
    next,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapeHtml(route.description)}" />`,
  );
  next = replaceOrInsertHeadTag(
    next,
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:type" content="${route.ogType}" />`,
  );
  next = replaceOrInsertHeadTag(
    next,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${canonicalUrl}" />`,
  );
  next = replaceOrInsertHeadTag(
    next,
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:image" content="${DEFAULT_OG_IMAGE}" />`,
  );
  next = replaceOrInsertHeadTag(
    next,
    /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:card" content="${route.twitterCard}" />`,
  );
  next = replaceOrInsertHeadTag(
    next,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`,
  );
  next = replaceOrInsertHeadTag(
    next,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`,
  );
  next = replaceOrInsertHeadTag(
    next,
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />`,
  );

  next = next.replace("</head>", `${jsonLdMarkup}  </head>`);

  return next;
}

function getRouteOutputPath(route: SeoRoute): string {
  if (route.path === "/") {
    return templatePath;
  }

  return path.join(publicDir, route.path.replace(/^\//, ""), "index.html");
}

async function prerender() {
  const template = await fs.readFile(templatePath, "utf-8");

  for (const route of seoRouteList) {
    const appHtml = renderToString(<PrerenderApp path={route.path} />);
    const html = applyRouteHead(
      template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`),
      route,
    );
    const outputPath = getRouteOutputPath(route);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, html, "utf-8");
  }

  await fs.writeFile(path.join(publicDir, "sitemap.xml"), buildSitemapXml(), "utf-8");
}

prerender().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
