import type { Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import dns from "node:dns/promises";
import net from "node:net";

const MAX_REDIRECTS = 5;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10000;

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
];

class ProxyRequestError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

function isPrivateIpv4(address: string): boolean {
  const parts = address.split(".").map(Number);
  const [a, b] = parts;

  return (
    a === 0 ||
    a === 10 ||
    (a === 100 && b >= 64 && b <= 127) ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIpv6(address: string): boolean {
  const normalized = address.toLowerCase();

  return (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("::ffff:") ||
    normalized.startsWith("2001:db8:") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
}

function isBlockedAddress(address: string): boolean {
  const version = net.isIP(address);

  if (version === 4) return isPrivateIpv4(address);
  if (version === 6) return isPrivateIpv6(address);

  return true;
}

async function assertAllowedUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new ProxyRequestError(400, "Enter a valid URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new ProxyRequestError(400, "Only HTTP and HTTPS URLs can be fetched.");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new ProxyRequestError(400, "Local and private network URLs cannot be fetched.");
  }

  const directIpVersion = net.isIP(hostname);
  if (directIpVersion && isBlockedAddress(hostname)) {
    throw new ProxyRequestError(400, "Local and private network URLs cannot be fetched.");
  }

  try {
    const addresses = await dns.lookup(hostname, { all: true });
    if (addresses.length === 0 || addresses.some(({ address }) => isBlockedAddress(address))) {
      throw new ProxyRequestError(400, "Local and private network URLs cannot be fetched.");
    }
  } catch (error) {
    if (error instanceof ProxyRequestError) throw error;
    throw new ProxyRequestError(400, "The URL host could not be resolved.");
  }

  return parsed;
}

function isReadableContentType(contentType: string): boolean {
  const normalized = contentType.toLowerCase();

  return (
    normalized.includes("text/html") ||
    normalized.includes("application/xhtml+xml") ||
    normalized.startsWith("text/plain") ||
    normalized.startsWith("text/")
  );
}

async function fetchReadableContent(initialUrl: string): Promise<string> {
  let currentUrl = await assertAllowedUrl(initialUrl);
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    const response = await axios.get<string>(currentUrl.toString(), {
      headers: {
        "User-Agent": userAgent,
        "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
        "Accept-Language": "en-US,en;q=0.5",
        "DNT": "1",
        "Upgrade-Insecure-Requests": "1",
      },
      timeout: FETCH_TIMEOUT_MS,
      maxRedirects: 0,
      maxContentLength: MAX_RESPONSE_BYTES,
      responseType: "text",
      transformResponse: [(data) => data],
      validateStatus: () => true,
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.location;
      if (!location) {
        throw new ProxyRequestError(502, "The source site returned a redirect without a destination.");
      }

      if (redirectCount === MAX_REDIRECTS) {
        throw new ProxyRequestError(502, "The source site redirected too many times.");
      }

      currentUrl = await assertAllowedUrl(new URL(location, currentUrl).toString());
      continue;
    }

    if (response.status === 429) {
      throw new ProxyRequestError(429, "The source site is rate limiting requests. Wait a bit, then try again.");
    }

    if (response.status === 404) {
      throw new ProxyRequestError(404, "The source URL was not found.");
    }

    if (response.status >= 400) {
      throw new ProxyRequestError(response.status, `The source site returned HTTP ${response.status}.`);
    }

    const contentLength = Number(response.headers["content-length"]);
    if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
      throw new ProxyRequestError(413, "The source page is too large to import.");
    }

    const contentType = String(response.headers["content-type"] || "");
    if (!isReadableContentType(contentType)) {
      throw new ProxyRequestError(415, "The source URL did not return a readable HTML or text page.");
    }

    return response.data;
  }

  throw new ProxyRequestError(502, "The source site redirected too many times.");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS Proxy endpoint for fetching external content
  app.get("/api/proxy", async (req, res) => {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Enter a URL to fetch." });
    }

    try {
      const html = await fetchReadableContent(url);
      res.status(200).type("text/html; charset=utf-8").send(html);
    } catch (error) {
      if (error instanceof ProxyRequestError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
        return res.status(504).json({ error: "The source site took too long to respond." });
      }

      if (axios.isAxiosError(error) && error.message.includes("maxContentLength")) {
        return res.status(413).json({ error: "The source page is too large to import." });
      }

      res.status(502).json({ error: "The source page could not be fetched." });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
