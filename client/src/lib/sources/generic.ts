import type { SourceAdapter } from "./types";

/**
 * Generic adapter: ordinary readable pages via Mozilla Readability.
 * Never claims whole-work support; single-page fetch only.
 */
export const genericAdapter: SourceAdapter = {
  id: "generic",
  handlesUrl: () => true,
  supportsWholeWork: () => false,
  normalizeWorkUrl: (url: string) => url,
};
