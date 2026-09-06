/**
 * Minimal source-adapter contract.
 *
 * Intentionally small: detect a URL, normalize it to a work, and (when the
 * source supports it) discover an ordered chapter manifest and extract
 * chapter content. Generic readable pages intentionally do NOT implement
 * whole-work support and fall through to the Mozilla Readability path.
 */
export interface WorkMetadata {
  title: string;
  author: string;
  workId?: string;
  sourceUrl: string;
}

export interface ChapterRef {
  /** Stable source-side key (e.g. AO3 chapter id). Used for dedupe. */
  id: string;
  url: string;
  title: string;
  order: number;
}

export interface WorkManifest {
  metadata: WorkMetadata;
  chapters: ChapterRef[];
}

export interface ParsedChapter {
  title: string;
  content: string;
}

export interface SourceAdapter {
  /** Machine-readable source id, e.g. "ao3" or "generic". */
  id: string;
  /** Whether this adapter handles the given URL. */
  handlesUrl(url: string): boolean;
  /** Whether whole-work (manifest-driven) import is supported for the URL. */
  supportsWholeWork(url: string): boolean;
  /** Normalize any handled URL to its canonical work URL. */
  normalizeWorkUrl(url: string): string;
}
