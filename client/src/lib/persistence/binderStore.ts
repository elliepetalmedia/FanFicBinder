import type { ChapterRef, WorkManifest } from "@/lib/sources/types";

/**
 * Browser-local binder persistence (IndexedDB, no backend).
 *
 * Everything here stays on the user's device. The module is split into
 * pure, Node-testable logic (serialize / deserialize + migrate / resume
 * diffing) and a thin native-IndexedDB wrapper that never throws: I/O
 * failures are reported as `{ ok: false }` so the app keeps working.
 */

export const PERSISTED_BINDER_VERSION = 1;

export const BINDER_DEFAULTS = {
  bookTitle: "My FanFic Binder",
  authorName: "Various Authors",
  font: "serif",
  spacing: "1.6",
  dropCaps: false,
  outputFormat: "epub",
} as const;

export type BinderOutputFormat = "epub" | "reader";

export interface PersistedChapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  sourceUrl?: string;
}

export interface PersistedCover {
  data: ArrayBuffer;
  mimeType: string;
}

export interface PersistedWorkImport {
  workUrl: string;
  manifest: WorkManifest;
  status: "in-progress";
}

export interface PersistedBinder {
  version: typeof PERSISTED_BINDER_VERSION;
  id: "current";
  updatedAt: number;
  bookTitle: string;
  authorName: string;
  font: string;
  spacing: string;
  dropCaps: boolean;
  outputFormat: BinderOutputFormat;
  cover: PersistedCover | null;
  chapters: PersistedChapter[];
  ao3Import: PersistedWorkImport | null;
}

export interface BinderDraft {
  bookTitle: string;
  authorName: string;
  font: string;
  spacing: string;
  dropCaps: boolean;
  outputFormat: BinderOutputFormat;
  coverImage: ArrayBuffer | null;
  coverMimeType: string;
  chapters: PersistedChapter[];
  ao3Import: PersistedWorkImport | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeChapter(raw: unknown): PersistedChapter | null {
  if (!isRecord(raw)) return null;
  const title = asOptionalString(raw.title);
  const content = typeof raw.content === "string" ? raw.content : null;
  if (!title || content === null) return null;
  const wordCount = typeof raw.wordCount === "number" && Number.isFinite(raw.wordCount) && raw.wordCount >= 0
    ? Math.floor(raw.wordCount)
    : 0;
  const chapter: PersistedChapter = {
    id: asString(raw.id, `restored-${Math.floor(Math.random() * 1e9)}`),
    title,
    content,
    wordCount,
  };
  const sourceUrl = asOptionalString(raw.sourceUrl);
  if (sourceUrl) chapter.sourceUrl = sourceUrl;
  return chapter;
}

function normalizeCover(raw: unknown): PersistedCover | null {
  if (!isRecord(raw)) return null;
  if (!(raw.data instanceof ArrayBuffer)) return null;
  return {
    data: raw.data,
    mimeType: asString(raw.mimeType, "image/jpeg"),
  };
}

function normalizeChapterRef(raw: unknown, index: number): ChapterRef | null {
  if (!isRecord(raw)) return null;
  const id = asOptionalString(raw.id);
  const url = isHttpUrl(raw.url) ? raw.url : null;
  const title = asOptionalString(raw.title);
  if (!id || !url || !title) return null;
  const order = typeof raw.order === "number" && Number.isFinite(raw.order) ? raw.order : index + 1;
  return { id, url, title, order };
}

function normalizeManifest(raw: unknown): WorkManifest | null {
  if (!isRecord(raw) || !isRecord(raw.metadata)) return null;
  const title = asOptionalString(raw.metadata.title);
  if (!title) return null;
  const chapters = Array.isArray(raw.chapters)
    ? raw.chapters
        .map((entry, index) => normalizeChapterRef(entry, index))
        .filter((entry): entry is ChapterRef => entry !== null)
    : [];
  if (chapters.length === 0) return null;
  return {
    metadata: {
      title,
      author: asString(raw.metadata.author, "Unknown Author"),
      sourceUrl: isHttpUrl(raw.metadata.sourceUrl) ? raw.metadata.sourceUrl : "",
      workId: asOptionalString(raw.metadata.workId),
    },
    chapters,
  };
}

function normalizeWorkImport(raw: unknown): PersistedWorkImport | null {
  if (!isRecord(raw)) return null;
  if (!isHttpUrl(raw.workUrl)) return null;
  const manifest = normalizeManifest(raw.manifest);
  if (!manifest) return null;
  return { workUrl: raw.workUrl, manifest, status: "in-progress" };
}

/** Build a versioned snapshot from live binder state. Pure. */
export function serializeBinder(draft: BinderDraft): PersistedBinder {
  return {
    version: PERSISTED_BINDER_VERSION,
    id: "current",
    updatedAt: Date.now(),
    bookTitle: draft.bookTitle || BINDER_DEFAULTS.bookTitle,
    authorName: draft.authorName || BINDER_DEFAULTS.authorName,
    font: draft.font || BINDER_DEFAULTS.font,
    spacing: draft.spacing || BINDER_DEFAULTS.spacing,
    dropCaps: draft.dropCaps,
    outputFormat: draft.outputFormat === "reader" ? "reader" : "epub",
    cover: draft.coverImage ? { data: draft.coverImage, mimeType: draft.coverMimeType || "image/jpeg" } : null,
    chapters: draft.chapters
      .map(normalizeChapter)
      .filter((chapter): chapter is PersistedChapter => chapter !== null),
    ao3Import: draft.ao3Import ? normalizeWorkImport(draft.ao3Import) : null,
  };
}

export interface DeserializeResult {
  snapshot: PersistedBinder | null;
  /** True when stored data targets a newer schema this client must not overwrite. */
  newerVersion: boolean;
}

/**
 * Validate + migrate stored state. Never throws: garbage and unknown shapes
 * yield `{ snapshot: null }`, newer schema versions set `newerVersion`.
 */
export function deserializeBinder(raw: unknown): DeserializeResult {
  if (!isRecord(raw)) return { snapshot: null, newerVersion: false };
  if (typeof raw.version === "number" && raw.version > PERSISTED_BINDER_VERSION) {
    return { snapshot: null, newerVersion: true };
  }

  const chapters = Array.isArray(raw.chapters)
    ? raw.chapters
        .map(normalizeChapter)
        .filter((chapter): chapter is PersistedChapter => chapter !== null)
    : [];
  const outputFormat = raw.outputFormat === "reader" ? "reader" : "epub";
  const updatedAt = typeof raw.updatedAt === "number" && Number.isFinite(raw.updatedAt) ? raw.updatedAt : Date.now();

  return {
    snapshot: {
      version: PERSISTED_BINDER_VERSION,
      id: "current",
      updatedAt,
      bookTitle: asString(raw.bookTitle, BINDER_DEFAULTS.bookTitle),
      authorName: asString(raw.authorName, BINDER_DEFAULTS.authorName),
      font: asString(raw.font, BINDER_DEFAULTS.font),
      spacing: asString(raw.spacing, BINDER_DEFAULTS.spacing),
      dropCaps: raw.dropCaps === true,
      outputFormat,
      cover: normalizeCover(raw.cover),
      chapters,
      ao3Import: normalizeWorkImport(raw.ao3Import),
    },
    newerVersion: false,
  };
}

/**
 * Append an imported chapter unless its stable source URL is already present.
 * Chapters without a source URL always append (preserves manual entries).
 */
export function appendUniqueChapter(
  chapters: PersistedChapter[],
  item: { title: string; content: string; wordCount: number; sourceUrl?: string },
): { chapters: PersistedChapter[]; added: boolean } {
  if (item.sourceUrl) {
    const duplicate = chapters.some((chapter) => chapter.sourceUrl === item.sourceUrl);
    if (duplicate) return { chapters, added: false };
  }
  const next: PersistedChapter = {
    id: `${Date.now().toString()}-${Math.floor(Math.random() * 1e6)}`,
    title: item.title,
    content: item.content,
    wordCount: item.wordCount,
  };
  if (item.sourceUrl) next.sourceUrl = item.sourceUrl;
  return { chapters: [...chapters, next], added: true };
}

/** Manifest entries whose URLs are not yet in the binder, in manifest order. Pure. */
export function getRemainingChapters(manifest: WorkManifest, existingUrls: Iterable<string>): ChapterRef[] {
  const known = new Set(existingUrls);
  return manifest.chapters.filter((chapter) => !known.has(chapter.url));
}

export function collectSourceUrls(chapters: Array<{ sourceUrl?: string }>): Set<string> {
  const urls = new Set<string>();
  for (const chapter of chapters) {
    if (chapter.sourceUrl) urls.add(chapter.sourceUrl);
  }
  return urls;
}

// --- Thin native-IndexedDB wrapper (browser only; never throws) ---

const DB_NAME = "fanficbinder";
const DB_STORE = "binder";
const DB_KEY = "current";

export type PersistResult = { ok: true } | { ok: false; reason: string };

export type LoadResult =
  | { ok: true; snapshot: PersistedBinder | null; newerVersion: boolean }
  | { ok: false; reason: string };

export function isPersistenceAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Local storage request failed."));
  });
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, PERSISTED_BINDER_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open local binder storage."));
    request.onblocked = () => reject(new Error("Local binder storage is blocked by another tab."));
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => Promise<T>): Promise<T> {
  const db = await openDatabase();
  try {
    const transaction = db.transaction(DB_STORE, mode);
    const result = await fn(transaction.objectStore(DB_STORE));
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Local binder storage write failed."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Local binder storage write was aborted."));
    });
    return result;
  } finally {
    db.close();
  }
}

function toReason(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Local binder storage is unavailable in this browser.";
}

export async function saveBinderSnapshot(snapshot: PersistedBinder): Promise<PersistResult> {
  if (!isPersistenceAvailable()) {
    return { ok: false, reason: "Local binder storage is unavailable in this browser." };
  }
  try {
    await withStore("readwrite", (store) => requestToPromise(store.put(snapshot, DB_KEY)));
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: toReason(error) };
  }
}

export async function loadBinderSnapshot(): Promise<LoadResult> {
  if (!isPersistenceAvailable()) {
    return { ok: false, reason: "Local binder storage is unavailable in this browser." };
  }
  try {
    const raw = await withStore("readonly", (store) => requestToPromise(store.get(DB_KEY)));
    if (raw === undefined || raw === null) {
      return { ok: true, snapshot: null, newerVersion: false };
    }
    const { snapshot, newerVersion } = deserializeBinder(raw);
    return { ok: true, snapshot, newerVersion };
  } catch (error) {
    return { ok: false, reason: toReason(error) };
  }
}

export async function clearBinderSnapshot(): Promise<PersistResult> {
  if (!isPersistenceAvailable()) {
    return { ok: false, reason: "Local binder storage is unavailable in this browser." };
  }
  try {
    await withStore("readwrite", (store) => requestToPromise(store.delete(DB_KEY)));
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: toReason(error) };
  }
}
