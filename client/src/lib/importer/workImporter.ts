import {
  detectAo3AccessGate,
  normalizeAo3WorkUrl,
  parseAo3Chapter,
  parseAo3FullWorkChapterTitles,
  parseAo3Manifest,
  parseAo3Metadata,
  parseAo3WorkId,
  splitAo3FullWorkChapters,
} from "@/lib/sources/ao3";
import type { WorkManifest } from "@/lib/sources/types";

export interface WorkImportProgress {
  completed: number;
  total: number;
  currentTitle: string;
  currentUrl: string;
}

export interface ImportedWorkChapter {
  title: string;
  content: string;
  sourceUrl: string;
}

export interface FailedChapter {
  url: string;
  title: string;
  error: string;
}

export interface WorkImportOutcome {
  imported: ImportedWorkChapter[];
  failed: FailedChapter[];
  cancelled: boolean;
}

export type HtmlFetcher = (url: string) => Promise<string>;

export interface WorkImportOptions {
  signal?: AbortSignal;
  onProgress?: (progress: WorkImportProgress) => void;
  /**
   * Called immediately after each chapter imports successfully, so callers
   * can append it to visible state (and persistence) before the run ends.
   */
  onChapter?: (chapter: ImportedWorkChapter) => void;
  /** Canonical chapter URLs already in the binder; these are skipped. */
  existingUrls?: Set<string> | string[];
  /** Polite pause between chapter requests. Default 1200ms. */
  delayMs?: number;
  maxRetries?: number;
}

const DEFAULT_DELAY_MS = 1200;
const DEFAULT_MAX_RETRIES = 3;

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException("Import cancelled.", "AbortError");
  }
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException ? error.name === "AbortError" : error instanceof Error && error.message === "Import cancelled."
  );
}

export function isRetryableImportError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /429|503|504|rate.?limit|too many requests|took too long|temporar|try again|econnaborted/i.test(message);
}

function backoffMs(attempt: number): number {
  return Math.min(10000, 1000 * 2 ** attempt) + Math.floor(Math.random() * 500);
}

function abortableDelay(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) {
    throwIfAborted(signal);
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Import cancelled.", "AbortError"));
    };
    if (signal?.aborted) {
      clearTimeout(timer);
      reject(new DOMException("Import cancelled.", "AbortError"));
      return;
    }
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

async function fetchWithRetry(url: string, fetchHtml: HtmlFetcher, options: WorkImportOptions): Promise<string> {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    throwIfAborted(options.signal);
    try {
      return await fetchHtml(url);
    } catch (error) {
      lastError = error;
      if (isAbortError(error)) throw error;
      const retryable = isRetryableImportError(error);
      const hasAttemptsLeft = attempt < maxRetries;
      if (!retryable || !hasAttemptsLeft) throw error;
      await abortableDelay(backoffMs(attempt), options.signal);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to fetch chapter.");
}

function toExistingSet(existing?: Set<string> | string[]): Set<string> {
  if (!existing) return new Set();
  return existing instanceof Set ? new Set(existing) : new Set(existing);
}

function describeGateError(gate: "login-required" | "adult-consent" | "not-found", url: string): Error {
  if (gate === "login-required") {
    return new Error(
      `This AO3 work (${url}) requires an AO3 login or is restricted. FanFicBinder only supports publicly accessible works. ` +
        "Open the chapter in your browser and use Manual Entry instead.",
    );
  }
  if (gate === "adult-consent") {
    return new Error(
      "This AO3 work shows an adult-content warning that could not be confirmed automatically. " +
        "Open it once in your browser, then try again, or use Manual Entry.",
    );
  }
  return new Error("That AO3 work was not found. Check the URL and try again.");
}

/**
 * Fetch the work page and build a deterministic chapter manifest.
 * Falls back to a single-chapter manifest when the page has chapter content
 * but no recognizable chapter index.
 */
export async function fetchAo3WorkManifest(workUrl: string, fetchHtml: HtmlFetcher, signal?: AbortSignal): Promise<WorkManifest> {
  const canonical = normalizeAo3WorkUrl(workUrl);
  const workId = parseAo3WorkId(canonical) ?? "";
  throwIfAborted(signal);

  const html = await fetchHtml(canonical);
  throwIfAborted(signal);

  const gate = detectAo3AccessGate(html);
  if (gate) throw describeGateError(gate, canonical);

  const manifest = parseAo3Manifest(html, canonical);
  if (manifest && manifest.chapters.length > 0) return manifest;

  // Single-chapter work (or index not recognized): one entry if content exists.
  const single = parseAo3Chapter(html);
  const meta = parseAo3Metadata(html);
  if (single) {
    const chapterIdMatch = canonical.match(/\/chapters\/(\d+)/i);
    return {
      metadata: {
        title: meta?.title || `AO3 Work ${workId}`,
        author: meta?.author || "Unknown Author",
        workId,
        sourceUrl: canonical,
      },
      chapters: [
        {
          id: chapterIdMatch ? chapterIdMatch[1] : `work-${workId}`,
          url: canonical,
          title: single.title,
          order: 1,
        },
      ],
    };
  }

  throw new Error(
    "No chapter list was found on that AO3 page. It may be restricted, or AO3 changed its layout. " +
      "Try fetching a single chapter URL, or use Manual Entry.",
  );
}

/**
 * Import every chapter in a manifest, sequentially and politely.
 *
 * - No parallel requests (sequential by design).
 * - Already-imported URLs are skipped, never duplicated.
 * - Successfully imported chapters are returned even when later chapters
 *   fail or the import is cancelled.
 */
export async function importAo3WorkChapters(
  manifest: WorkManifest,
  fetchHtml: HtmlFetcher,
  options: WorkImportOptions = {},
): Promise<WorkImportOutcome> {
  const existing = toExistingSet(options.existingUrls);
  const delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  const imported: ImportedWorkChapter[] = [];
  const failed: FailedChapter[] = [];
  const seenInRun = new Set<string>(existing);

  // Fast path: if the manifest page itself was a full-work response already
  // fetched by the caller it can pass bodies via fetchHtml returning the same
  // HTML; the per-chapter loop below still guarantees correct ordering.

  for (let index = 0; index < manifest.chapters.length; index++) {
    const ref = manifest.chapters[index];
    if (options.signal?.aborted) {
      return { imported, failed, cancelled: true };
    }
    if (seenInRun.has(ref.url)) {
      options.onProgress?.({
        completed: imported.length,
        total: manifest.chapters.length,
        currentTitle: `Skipped (already in binder): ${ref.title}`,
        currentUrl: ref.url,
      });
      continue;
    }

    options.onProgress?.({
      completed: imported.length,
      total: manifest.chapters.length,
      currentTitle: ref.title,
      currentUrl: ref.url,
    });

    try {
      const html = await fetchWithRetry(ref.url, fetchHtml, options);
      throwIfAborted(options.signal);

      const gate = detectAo3AccessGate(html);
      if (gate) throw describeGateError(gate, ref.url);

      // If a chapter URL unexpectedly returns a full-work document, prefer
      // the matching section only when it lines up with the manifest.
      let content: string | null = null;
      let title = ref.title;
      const bodies = splitAo3FullWorkChapters(html);
      if (bodies && bodies.length === manifest.chapters.length) {
        const titles = parseAo3FullWorkChapterTitles(html);
        content = bodies[index] ?? null;
        if (titles[index]) title = titles[index];
      } else {
        const parsed = parseAo3Chapter(html);
        if (parsed) {
          content = parsed.content;
          if (parsed.title && parsed.title !== "Unknown Chapter") title = parsed.title;
        }
      }

      if (!content) {
        throw new Error(`No readable chapter text was found at ${ref.url}. The chapter may be restricted; use Manual Entry for it.`);
      }

      imported.push({ title, content, sourceUrl: ref.url });
      seenInRun.add(ref.url);
      options.onChapter?.({ title, content, sourceUrl: ref.url });
      options.onProgress?.({
        completed: imported.length,
        total: manifest.chapters.length,
        currentTitle: title,
        currentUrl: ref.url,
      });
    } catch (error) {
      if (isAbortError(error) || options.signal?.aborted) {
        return { imported, failed, cancelled: true };
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      failed.push({ url: ref.url, title: ref.title, error: message });
    }

    if (index < manifest.chapters.length - 1) {
      try {
        await abortableDelay(delayMs, options.signal);
      } catch (error) {
        if (isAbortError(error)) return { imported, failed, cancelled: true };
        throw error;
      }
    }
  }

  return { imported, failed, cancelled: options.signal?.aborted ?? false };
}
