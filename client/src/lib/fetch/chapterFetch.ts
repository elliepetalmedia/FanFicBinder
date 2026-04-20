import { Readability } from "@mozilla/readability";

type ReadabilityArticle = NonNullable<ReturnType<Readability["parse"]>>;

export interface FetchChapterResult {
  title: string;
  content: string;
  nextUrl?: string | null;
}

export function validateFetchUrl(url: string): URL {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Only HTTP and HTTPS URLs can be fetched.");
    }
    return parsed;
  } catch (error) {
    if (error instanceof Error && error.message.includes("HTTP")) throw error;
    throw new Error("Enter a valid URL that starts with http:// or https://.");
  }
}

async function readProxyError(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await response.json().catch(() => null);
    if (data && typeof data.error === "string") return data.error;
  }

  return response.statusText || `HTTP ${response.status}`;
}

async function fetchViaFirstPartyProxy(url: string): Promise<string> {
  const parsed = validateFetchUrl(url);
  const response = await fetch(`/api/proxy?url=${encodeURIComponent(parsed.toString())}`);

  if (!response.ok) {
    throw new Error(await readProxyError(response));
  }

  const text = await response.text();
  if (!text.trim()) {
    throw new Error("The source page returned no readable content.");
  }

  if (text.includes('src="/src/main.tsx"')) {
    throw new Error("The local proxy is not available. Run the full dev server or deploy the Netlify function.");
  }

  return text;
}

function fallbackArticle(doc: Document, title: string, content: string): ReadabilityArticle {
  return {
    title,
    content,
    textContent: content.replace(/<[^>]*>/g, " "),
    length: content.length,
    excerpt: "",
    byline: "",
    dir: doc.dir || "",
    siteName: "",
    lang: doc.documentElement.lang || "en",
    publishedTime: null,
  };
}

export function findFallbackContent(doc: Document, url: string): string {
  if (url.includes("archiveofourown.org")) {
    return doc.querySelector("#workskin")?.innerHTML || "";
  }

  if (url.includes("royalroad.com")) {
    return doc.querySelector(".chapter-content")?.innerHTML || "";
  }

  const articleTag =
    doc.querySelector("article") ||
    doc.querySelector("main") ||
    doc.querySelector(".content") ||
    doc.querySelector("#content");

  return articleTag?.innerHTML || "";
}

export function findNextChapterUrl(doc: Document, url: string): string | null {
  if (url.includes("archiveofourown.org")) {
    const ao3Next = doc.querySelector("li.chapter.next a");
    if (ao3Next) return (ao3Next as HTMLAnchorElement).href;
  }

  if (url.includes("royalroad.com")) {
    const rrNext = Array.from(doc.querySelectorAll("a")).find(
      (anchor) =>
        anchor.textContent?.toLowerCase().includes("next chapter") &&
        !anchor.textContent?.toLowerCase().includes("next part"),
    );
    if (rrNext) return (rrNext as HTMLAnchorElement).href;
  }

  const links = Array.from(doc.querySelectorAll("a"));
  for (const link of links) {
    const text = (link.textContent || "").trim().toLowerCase();

    if (text.includes("work") || text.includes("series") || text.includes("book") || text.includes("volume")) {
      continue;
    }

    if (text === "next" || text === "next chapter" || text === "next >" || text === ">") {
      return link.href;
    }
  }

  return null;
}

export async function mockFetchUrl(url: string): Promise<FetchChapterResult> {
  try {
    const parsedUrl = validateFetchUrl(url);

    if (parsedUrl.hostname.includes("wattpad.com")) {
      throw new Error('Wattpad blocks external tools. Please open the chapter, copy the text, and use the "Manual" tab.');
    }

    const html = await fetchViaFirstPartyProxy(parsedUrl.toString());
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const base = doc.createElement("base");
    base.href = url;
    doc.head.appendChild(base);

    const reader = new Readability(doc.cloneNode(true) as Document);
    let article = reader.parse();

    if (!article || !article.content || article.content.trim().length < 200) {
      const fallbackContent = findFallbackContent(doc, parsedUrl.toString());
      const fallbackTitle = doc.title || "Unknown Chapter";

      if (fallbackContent) {
        article = fallbackArticle(doc, fallbackTitle, fallbackContent);
      } else if (!article || !article.content) {
        throw new Error("No readable story text was found on that page.");
      }
    }

    if (!article || !article.content) {
      throw new Error("No readable story text was found on that page.");
    }

    return {
      title: article.title || "Unknown Chapter",
      content: article.content,
      nextUrl: findNextChapterUrl(doc, parsedUrl.toString()),
    };
  } catch (error) {
    console.error("Fetch error:", error);

    if (url.includes("wattpad.com")) {
      throw new Error('Wattpad blocks external tools. Please open the chapter, copy the text, and use the "Manual" tab.');
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`${errorMessage} Try manual entry if the source blocks fetching.`);
  }
}
