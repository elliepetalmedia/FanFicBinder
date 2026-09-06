/**
 * Guide → converter handoff.
 *
 * Guide pages never convert content themselves. They collect a story/chapter
 * URL and route the user into the homepage converter with the URL preserved
 * in `?url=`, keeping the Home conversion engine the single source of truth.
 */

export const CONVERTER_PATH = "/";

function toValidHttpUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/** Build the converter URL carrying a story/chapter URL. Throws on invalid input. */
export function buildConverterHandoffUrl(rawUrl: string): string {
  const valid = toValidHttpUrl(rawUrl);
  if (!valid) {
    throw new Error("Enter a full URL starting with http:// or https://.");
  }
  return `${CONVERTER_PATH}?url=${encodeURIComponent(valid)}`;
}

/** Read a handed-off URL back out of a location.search string. Null when absent/invalid. */
export function parseConverterHandoff(search: string): string | null {
  try {
    const params = new URLSearchParams(search);
    const handed = params.get("url");
    if (!handed) return null;
    return toValidHttpUrl(handed);
  } catch {
    return null;
  }
}
