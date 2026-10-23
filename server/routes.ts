import type { Express } from "express";
import { createServer, type Server } from "node:http";

import { fetchReadableContent, isCrossSiteRequest, proxyErrorResponse } from "../shared/proxy-fetch";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const RATE_LIMIT_MAX_CLIENTS = 10_000;
const proxyRateLimits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(clientId: string, now = Date.now()): boolean {
  const existing = proxyRateLimits.get(clientId);
  if (!existing || existing.resetAt <= now) {
    if (!existing && proxyRateLimits.size >= RATE_LIMIT_MAX_CLIENTS) {
      const oldest = proxyRateLimits.keys().next().value;
      if (oldest) proxyRateLimits.delete(oldest);
    }
    proxyRateLimits.set(clientId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  existing.count += 1;
  return existing.count > RATE_LIMIT_MAX_REQUESTS;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/proxy", async (req, res) => {
    if (isRateLimited(req.ip || req.socket.remoteAddress || "unknown")) {
      return res.status(429).set("Retry-After", "60").json({ error: "Too many proxy requests. Try again shortly." });
    }

    const requestUrl = new URL(req.originalUrl, `${req.protocol}://${req.get("host")}`);
    const headers = Object.fromEntries(
      Object.entries(req.headers).map(([name, value]) => [name, Array.isArray(value) ? value[0] : value]),
    );

    if (isCrossSiteRequest(headers, requestUrl)) {
      return res.status(403).json({ error: "Cross-site proxy requests are not allowed." });
    }

    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Enter a URL to fetch." });
    }

    try {
      const content = await fetchReadableContent(url);
      return res
        .status(200)
        .set({
          "Cache-Control": "no-store",
          "Content-Security-Policy": "default-src 'none'; sandbox",
          "Content-Type": "text/plain; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
        })
        .send(content);
    } catch (error) {
      const response = proxyErrorResponse(error);
      return res.status(response.status).json({ error: response.message });
    }
  });

  return createServer(app);
}
