import { ao3Adapter, isAo3WorkUrl } from "./ao3";
import { genericAdapter } from "./generic";
import type { SourceAdapter } from "./types";

export * from "./types";
export { ao3Adapter } from "./ao3";
export { genericAdapter } from "./generic";
export {
  detectAo3AccessGate,
  isAo3Host,
  isAo3WorkUrl,
  normalizeAo3ChapterUrl,
  normalizeAo3WorkUrl,
  parseAo3Chapter,
  parseAo3FullWorkChapterTitles,
  parseAo3Manifest,
  parseAo3Metadata,
  parseAo3WorkId,
  splitAo3FullWorkChapters,
} from "./ao3";

/** AO3 is the only first-class whole-work source. Everything else is generic. */
export function getAdapterForUrl(url: string): SourceAdapter {
  if (isAo3WorkUrl(url)) return ao3Adapter;
  return genericAdapter;
}

export function supportsWholeWork(url: string): boolean {
  return getAdapterForUrl(url).supportsWholeWork(url);
}
