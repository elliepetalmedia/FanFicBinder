import type { ChapterRef, SourceAdapter, WorkManifest, WorkMetadata } from "./types";

/**
 * AO3 source adapter (public works only).
 *
 * No authentication, no cookies, no login-restricted work support. All
 * parsing is pure string processing so it runs in the browser and in Node
 * tests without a DOM.
 */

const AO3_HOST_SUFFIX = "archiveofourown.org";
const WORK_ID_PATTERN = /\/works\/(\d+)/i;

export function isAo3Host(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname === AO3_HOST_SUFFIX || hostname.endsWith(`.${AO3_HOST_SUFFIX}`);
  } catch {
    return false;
  }
}

/** Matches /works/{id} and chapter URLs belonging to a work. */
export function isAo3WorkUrl(url: string): boolean {
  if (!isAo3Host(url)) return false;
  try {
    const parsed = new URL(url);
    return WORK_ID_PATTERN.test(parsed.pathname);
  } catch {
    return false;
  }
}

export function parseAo3WorkId(url: string): string | null {
  try {
    const match = new URL(url).pathname.match(WORK_ID_PATTERN);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/** Normalize any AO3 work/chapter URL to https://archiveofourown.org/works/{id} */
export function normalizeAo3WorkUrl(url: string): string {
  const workId = parseAo3WorkId(url);
  if (!workId || !isAo3Host(url)) {
    throw new Error("That URL is not an AO3 work URL (expected archiveofourown.org/works/{id}).");
  }
  return `https://${AO3_HOST_SUFFIX}/works/${workId}`;
}

export function normalizeAo3ChapterUrl(raw: string, workId: string): string {
  try {
    const resolved = new URL(raw, `https://${AO3_HOST_SUFFIX}/works/${workId}`);
    const chapterMatch = resolved.pathname.match(/\/chapters\/(\d+)/i);
    if (chapterMatch) {
      return `https://${AO3_HOST_SUFFIX}/works/${workId}/chapters/${chapterMatch[1]}`;
    }
    return resolved.toString();
  } catch {
    return raw;
  }
}

function stripTags(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

/** Public metadata: work title + author. Returns null when not found. */
export function parseAo3Metadata(html: string): { title: string; author: string } | null {
  if (!html || typeof html !== "string") return null;

  const titleMatch =
    html.match(/<h2[^>]*class="[^"]*\btitle\b[^"]*\bheading\b[^"]*"[^>]*>([\s\S]*?)<\/h2>/i) ||
    html.match(/<h2[^>]*class="[^"]*\btitle\b[^"]*"[^>]*>([\s\S]*?)<\/h2>/i);
  const bylineMatch = html.match(/<h3[^>]*class="[^"]*\bbyline\b[^"]*"[^>]*>([\s\S]*?)<\/h3>/i);

  const title = titleMatch ? stripTags(titleMatch[1]) : "";
  let author = "";
  if (bylineMatch) {
    const authorLink = bylineMatch[1].match(/<a[^>]*rel=["']author["'][^>]*>([\s\S]*?)<\/a>/i);
    author = stripTags(authorLink ? authorLink[1] : bylineMatch[1]).replace(/^by\s+/i, "");
  }

  if (!title) return null;
  return { title, author: author || "Unknown Author" };
}

export type Ao3AccessGate = "login-required" | "adult-consent" | "not-found" | null;

/** Detect gates we must NOT bypass (login walls) vs actionable states. */
export function detectAo3AccessGate(html: string): Ao3AccessGate {
  if (!html || typeof html !== "string") return null;
  if (/only available to (registered|logged-in|archive) users/i.test(html)) return "login-required";
  if (/this work is part of an unrevealed collection/i.test(html)) return "login-required";
  if (/log in to (view|access)/i.test(html) && /restricted/i.test(html)) return "login-required";
  if (/this work could have adult content/i.test(html)) {
    return /view_adult=true|i am (over|an adult)|i agree/i.test(html) ? null : "adult-consent";
  }
  if (/work not found|this work has been deleted|404/i.test(html) && !/chapter/i.test(html)) {
    return "not-found";
  }
  return null;
}

function extractManifestLinks(html: string, workId: string): Array<{ chapterId: string; url: string; title: string }> {
  const found: Array<{ chapterId: string; url: string; title: string }> = [];
  const seen = new Set<string>();

  // 1. Chapter index list: <ol class="chapter index group">…<a href="…/chapters/ID">Title</a>
  const listBlocks = html.match(/<ol[^>]*class="[^"]*\bchapter\b[^"]*\bindex\b[^"]*"[^>]*>([\s\S]*?)<\/ol>/gi) || [];
  for (const block of listBlocks) {
    const linkPattern = /<a[^>]*href="([^"]*\/works\/\d+\/chapters\/(\d+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = linkPattern.exec(block)) !== null) {
      const chapterId = m[2];
      if (seen.has(chapterId)) continue;
      seen.add(chapterId);
      found.push({
        chapterId,
        url: normalizeAo3ChapterUrl(decodeEntities(m[1]), workId),
        title: stripTags(m[3]) || `Chapter ${found.length + 1}`,
      });
    }
  }

  // 2. Chapter dropdown: <select id="selected_id">…<option value="…/chapters/ID">…</option>
  const selectBlocks = html.match(/<select[^>]*id="selected_id"[^>]*>([\s\S]*?)<\/select>/gi) || [];
  for (const block of selectBlocks) {
    const optionPattern = /<option[^>]*value="([^"]+)"[^>]*>([\s\S]*?)<\/option>/gi;
    let m: RegExpExecArray | null;
    while ((m = optionPattern.exec(block)) !== null) {
      const raw = decodeEntities(m[1]);
      const idMatch = raw.match(/\/chapters\/(\d+)/i) || raw.match(/^(\d+)$/);
      if (!idMatch) continue;
      const chapterId = idMatch[1];
      if (seen.has(chapterId)) continue;
      seen.add(chapterId);
      const absolute = /^\d+$/.test(raw)
        ? `https://${AO3_HOST_SUFFIX}/works/${workId}/chapters/${chapterId}`
        : normalizeAo3ChapterUrl(raw, workId);
      const label = stripTags(m[2]).replace(/^\d+\.\s*/, "");
      found.push({ chapterId, url: absolute, title: label || `Chapter ${found.length + 1}` });
    }
  }

  // 3. Generic fallback: any work-chapter link in document order (deduped).
  if (found.length === 0) {
    const linkPattern = /<a[^>]*href="([^"]*\/works\/\d+\/chapters\/(\d+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = linkPattern.exec(html)) !== null) {
      const chapterId = m[2];
      if (seen.has(chapterId)) continue;
      const label = stripTags(m[3]);
      // Skip nav chrome ("Next Chapter", "Entire Work", "Full-page index").
      if (/^(next|previous|entire work|full-page index|chapter index)\b/i.test(label)) continue;
      seen.add(chapterId);
      found.push({
        chapterId,
        url: normalizeAo3ChapterUrl(decodeEntities(m[1]), workId),
        title: label || `Chapter ${found.length + 1}`,
      });
    }
  }

  return found;
}

/**
 * Build an ordered manifest from a work/chapter page. Returns null when the
 * page has no recognizable chapter list (caller falls back to single-chapter).
 */
export function parseAo3Manifest(html: string, workUrl: string): WorkManifest | null {
  const workId = parseAo3WorkId(workUrl);
  if (!workId || !html) return null;

  const links = extractManifestLinks(html, workId);
  if (links.length === 0) return null;

  const meta = parseAo3Metadata(html);
  const canonical = normalizeAo3WorkUrl(workUrl);
  const metadata: WorkMetadata = {
    title: meta?.title || `AO3 Work ${workId}`,
    author: meta?.author || "Unknown Author",
    workId,
    sourceUrl: canonical,
  };

  const chapters: ChapterRef[] = links.map((link, index) => ({
    id: link.chapterId,
    url: link.url,
    title: link.title,
    order: index + 1,
  }));

  return { metadata, chapters };
}

/** Extract the first userstuff chapter body from an AO3 chapter page. */
export function parseAo3Chapter(html: string): { title: string; content: string } | null {
  if (!html || typeof html !== "string") return null;

  const titleMatch =
    html.match(/<div[^>]*class="[^"]*\bchapter\b[^"]*\bpreface\b[^"]*"[^>]*>[\s\S]*?<h3[^>]*class="[^"]*\btitle\b[^"]*"[^>]*>([\s\S]*?)<\/h3>/i) ||
    html.match(/<h3[^>]*class="[^"]*\btitle\b[^"]*"[^>]*>([\s\S]*?)<\/h3>/i);

  const bodyMatch = html.match(/<div[^>]*class="[^"]*\buserstuff\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (!bodyMatch) return null;

  const title = titleMatch ? stripTags(titleMatch[1]) : "Unknown Chapter";
  return { title: title || "Unknown Chapter", content: bodyMatch[1].trim() };
}

/**
 * Fast-path splitter: when a response already contains several userstuff
 * bodies (e.g. ?view_full_work=true within size limits), split them in
 * document order. Returns null when fewer than 2 bodies are present.
 */
export function splitAo3FullWorkChapters(html: string): string[] | null {
  if (!html) return null;
  const bodies: string[] = [];
  const pattern = /<div[^>]*class="[^"]*\buserstuff\b[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(html)) !== null) {
    const body = m[1].trim();
    if (body) bodies.push(body);
  }
  return bodies.length >= 2 ? bodies : null;
}

/** Titles for full-work bodies, in document order. */
export function parseAo3FullWorkChapterTitles(html: string): string[] {
  const titles: string[] = [];
  const prefacePattern = /<div[^>]*class="[^"]*\bchapter\b[^"]*"[^>]*id="chapter-\d+"[^>]*>[\s\S]*?<h3[^>]*class="[^"]*\btitle\b[^"]*"[^>]*>([\s\S]*?)<\/h3>/gi;
  let m: RegExpExecArray | null;
  while ((m = prefacePattern.exec(html)) !== null) {
    titles.push(stripTags(m[1]) || `Chapter ${titles.length + 1}`);
  }
  return titles;
}

export const ao3Adapter: SourceAdapter = {
  id: "ao3",
  handlesUrl: isAo3WorkUrl,
  supportsWholeWork: isAo3WorkUrl,
  normalizeWorkUrl: normalizeAo3WorkUrl,
};
