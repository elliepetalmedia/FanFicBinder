export {
  countWords,
  escapeXml,
  plainTextToChapterContent,
  type BookMetadata,
  type Chapter,
} from "./chapter";
export { sanitizeContent } from "./content/sanitize";
export { generateEpub, type ExportOptions } from "./exporters/epub";
export { generateAudiobookHTML, generateReaderModeHTML } from "./exporters/readerHtml";
export {
  findFallbackContent,
  findNextChapterUrl,
  fetchViaFirstPartyProxy,
  mockFetchUrl,
  validateFetchUrl,
  type FetchChapterResult,
} from "./fetch/chapterFetch";
export {
  fetchAo3WorkManifest,
  importAo3WorkChapters,
  isRetryableImportError,
  type FailedChapter,
  type HtmlFetcher,
  type ImportedWorkChapter,
  type WorkImportOptions,
  type WorkImportOutcome,
  type WorkImportProgress,
} from "./importer/workImporter";
export {
  ao3Adapter,
  detectAo3AccessGate,
  genericAdapter,
  getAdapterForUrl,
  isAo3Host,
  isAo3WorkUrl,
  normalizeAo3WorkUrl,
  parseAo3Chapter,
  parseAo3Manifest,
  parseAo3Metadata,
  parseAo3WorkId,
  supportsWholeWork,
  type ChapterRef,
  type SourceAdapter,
  type WorkManifest,
  type WorkMetadata,
} from "./sources/index";
