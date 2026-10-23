import axios from "axios";
import dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import net from "node:net";

export const MAX_REDIRECTS = 5;
export const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
export const FETCH_TIMEOUT_MS = 10_000;
export const TOTAL_FETCH_TIMEOUT_MS = 20_000;
const DNS_TIMEOUT_MS = 2_000;

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
];

const BLOCKED_ADDRESSES = new net.BlockList();

for (const [network, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.88.99.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15],
  ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4],
] as const) {
  BLOCKED_ADDRESSES.addSubnet(network, prefix, "ipv4");
}

for (const [network, prefix] of [
  ["::", 128], ["::1", 128], ["64:ff9b::", 96],
  ["64:ff9b:1::", 48], ["100::", 64], ["2001::", 32], ["2001:2::", 48],
  ["2001:db8::", 32], ["2002::", 16], ["fc00::", 7], ["fe80::", 10], ["ff00::", 8],
] as const) {
  BLOCKED_ADDRESSES.addSubnet(network, prefix, "ipv6");
}

export class ProxyRequestError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export interface ResolvedTarget {
  url: URL;
  hostname: string;
  address: string;
  family: 4 | 6;
}

type LookupResult = { address: string; family: number };
type LookupAll = (hostname: string, options: { all: true }) => Promise<LookupResult[]>;

function normalizeHostname(hostname: string): string {
  return hostname.replace(/^\[|\]$/g, "").toLowerCase();
}

export function isBlockedAddress(address: string): boolean {
  const normalized = normalizeHostname(address);
  const family = net.isIP(normalized);
  return family === 0 || BLOCKED_ADDRESSES.check(normalized, family === 4 ? "ipv4" : "ipv6");
}

async function lookupWithTimeout(hostname: string, lookup: LookupAll, timeoutMs: number): Promise<LookupResult[]> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      lookup(hostname, { all: true }),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new ProxyRequestError(504, "The source site took too long to respond.")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function resolveAllowedTarget(
  rawUrl: string,
  lookup: LookupAll = dns.lookup,
  deadline = Date.now() + DNS_TIMEOUT_MS,
): Promise<ResolvedTarget> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new ProxyRequestError(400, "Enter a valid URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new ProxyRequestError(400, "Only HTTP and HTTPS URLs can be fetched.");
  }
  if (parsed.username || parsed.password) {
    throw new ProxyRequestError(400, "URLs containing credentials cannot be fetched.");
  }
  if ((parsed.protocol === "http:" && parsed.port && parsed.port !== "80") ||
      (parsed.protocol === "https:" && parsed.port && parsed.port !== "443")) {
    throw new ProxyRequestError(400, "Only standard HTTP and HTTPS ports can be fetched.");
  }

  const hostname = normalizeHostname(parsed.hostname);
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new ProxyRequestError(400, "Local and private network URLs cannot be fetched.");
  }

  const directFamily = net.isIP(hostname);
  if (directFamily) {
    if (isBlockedAddress(hostname)) {
      throw new ProxyRequestError(400, "Local and private network URLs cannot be fetched.");
    }
    return { url: parsed, hostname, address: hostname, family: directFamily as 4 | 6 };
  }

  try {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) throw new ProxyRequestError(504, "The source site took too long to respond.");
    const addresses = await lookupWithTimeout(hostname, lookup, Math.min(DNS_TIMEOUT_MS, remainingMs));
    if (addresses.length === 0 || addresses.some(({ address }) => isBlockedAddress(address))) {
      throw new ProxyRequestError(400, "Local and private network URLs cannot be fetched.");
    }
    const selected = addresses[0];
    return { url: parsed, hostname, address: selected.address, family: selected.family as 4 | 6 };
  } catch (error) {
    if (error instanceof ProxyRequestError) throw error;
    throw new ProxyRequestError(400, "The URL host could not be resolved.");
  }
}

export function createPinnedAgents(target: ResolvedTarget): { httpAgent: http.Agent; httpsAgent: https.Agent } {
  const lookup: import("node:net").LookupFunction = (hostname, options, callback) => {
    if (normalizeHostname(hostname) !== target.hostname) {
      callback(Object.assign(new Error("Unexpected hostname during connection"), { code: "EAI_FAIL" }), "", 0);
      return;
    }
    if (options?.all) {
      callback(null, [{ address: target.address, family: target.family }]);
      return;
    }
    callback(null, target.address, target.family);
  };
  return {
    httpAgent: new http.Agent({ keepAlive: false, lookup }),
    httpsAgent: new https.Agent({ keepAlive: false, lookup }),
  };
}

export function isReadableContentType(contentType: string): boolean {
  const mimeType = contentType.split(";", 1)[0].trim().toLowerCase();
  return mimeType === "text/html" || mimeType === "application/xhtml+xml" || mimeType === "text/plain";
}

export async function fetchReadableContent(initialUrl: string): Promise<string> {
  const deadline = Date.now() + TOTAL_FETCH_TIMEOUT_MS;
  let target = await resolveAllowedTarget(initialUrl, dns.lookup, deadline);
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) throw new ProxyRequestError(504, "The source site took too long to respond.");
    const requestTimeoutMs = Math.min(FETCH_TIMEOUT_MS, remainingMs);
    const response = await axios.get<string>(target.url.toString(), {
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9",
        "Accept-Language": "en-US,en;q=0.5",
        DNT: "1",
      },
      timeout: requestTimeoutMs,
      signal: AbortSignal.timeout(requestTimeoutMs),
      maxRedirects: 0,
      maxContentLength: MAX_RESPONSE_BYTES,
      maxBodyLength: MAX_RESPONSE_BYTES,
      responseType: "text",
      transformResponse: [(data) => data],
      validateStatus: () => true,
      proxy: false,
      ...createPinnedAgents(target),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.location;
      if (!location) throw new ProxyRequestError(502, "The source site returned a redirect without a destination.");
      if (redirectCount === MAX_REDIRECTS) throw new ProxyRequestError(502, "The source site redirected too many times.");
      target = await resolveAllowedTarget(new URL(location, target.url).toString(), dns.lookup, deadline);
      continue;
    }
    if (response.status === 429) throw new ProxyRequestError(429, "The source site is rate limiting requests. Wait a bit, then try again.");
    if (response.status === 404) throw new ProxyRequestError(404, "The source URL was not found.");
    if (response.status >= 400) throw new ProxyRequestError(502, `The source site returned HTTP ${response.status}.`);

    const contentType = String(response.headers["content-type"] || "");
    if (!isReadableContentType(contentType)) {
      throw new ProxyRequestError(415, "The source URL did not return an HTML or plain-text page.");
    }
    if (Buffer.byteLength(response.data, "utf8") > MAX_RESPONSE_BYTES) {
      throw new ProxyRequestError(413, "The source page is too large to import.");
    }
    return response.data;
  }
  throw new ProxyRequestError(502, "The source site redirected too many times.");
}

export function isCrossSiteRequest(headers: Record<string, string | undefined>, requestUrl: URL): boolean {
  if (headers["sec-fetch-site"] === "cross-site") return true;
  const origin = headers.origin;
  if (!origin) return false;
  try {
    return new URL(origin).origin !== requestUrl.origin;
  } catch {
    return true;
  }
}

export function proxyErrorResponse(error: unknown): { status: number; message: string } {
  if (error instanceof ProxyRequestError) return { status: error.statusCode, message: error.message };
  if (axios.isAxiosError(error) && (error.code === "ECONNABORTED" || error.code === "ERR_CANCELED")) {
    return { status: 504, message: "The source site took too long to respond." };
  }
  if (axios.isAxiosError(error) && error.message.includes("maxContentLength")) {
    return { status: 413, message: "The source page is too large to import." };
  }
  return { status: 502, message: "The source page could not be fetched." };
}
