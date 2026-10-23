import { fetchReadableContent, isCrossSiteRequest, proxyErrorResponse } from "../shared/proxy-fetch.ts";

const SECURITY_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; sandbox",
  "X-Content-Type-Options": "nosniff",
};

export function createHandler(fetcher = fetchReadableContent) {
  return async function handler(request) {
    const requestUrl = new URL(request.url);
    if (request.method !== "GET") {
      return Response.json(
        { error: "Only GET requests are supported." },
        { status: 405, headers: { ...SECURITY_HEADERS, Allow: "GET" } },
      );
    }

    const requestHeaders = Object.fromEntries(request.headers.entries());
    if (isCrossSiteRequest(requestHeaders, requestUrl)) {
      return Response.json(
        { error: "Cross-site proxy requests are not allowed." },
        { status: 403, headers: SECURITY_HEADERS },
      );
    }

    const url = requestUrl.searchParams.get("url");
    if (!url) {
      return Response.json({ error: "Enter a URL to fetch." }, { status: 400, headers: SECURITY_HEADERS });
    }

    try {
      const content = await fetcher(url);
      return new Response(content, {
        status: 200,
        headers: { ...SECURITY_HEADERS, "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch (error) {
      const response = proxyErrorResponse(error);
      return Response.json({ error: response.message }, { status: response.status, headers: SECURITY_HEADERS });
    }
  };
}

export default createHandler();

export const config = {
  path: "/api/proxy",
  rateLimit: {
    windowLimit: 30,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
