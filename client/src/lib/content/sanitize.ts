import { escapeXml } from "@/lib/chapter";

const UNSAFE_SELECTORS = ["script", "style", "iframe", "noscript", "object", "embed"];

function stripUnsafeMarkup(content: string): string {
  return content
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(["']).*?\1/gi, "")
    .replace(/\s(?:href|src)\s*=\s*(["'])\s*(?:javascript:|data:text\/html)[\s\S]*?\1/gi, "");
}

export function sanitizeContent(content: string): string {
  try {
    if (typeof DOMParser === "undefined" || typeof XMLSerializer === "undefined") {
      const clean = stripUnsafeMarkup(content).trim();
      return clean || "<p>&#160;</p>";
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${content}</body>`, "text/html");
    const body = doc.body;

    UNSAFE_SELECTORS.forEach((selector) => {
      body.querySelectorAll(selector).forEach((element) => element.remove());
    });

    body.querySelectorAll("*").forEach((element) => {
      Array.from(element.attributes).forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const value = attribute.value.trim().toLowerCase();

        if (
          name.startsWith("on") ||
          value.startsWith("javascript:") ||
          value.startsWith("data:text/html")
        ) {
          element.removeAttribute(attribute.name);
        }
      });
    });

    body.querySelectorAll("img").forEach((image) => {
      if (!image.hasAttribute("alt")) image.setAttribute("alt", "");
    });

    const serializer = new XMLSerializer();
    let serialized = "";
    Array.from(body.childNodes).forEach((node) => {
      serialized += serializer.serializeToString(node);
    });

    if (!serialized) {
      serialized = escapeXml(body.textContent || "");
      if (serialized && !serialized.startsWith("<")) {
        serialized = `<p>${serialized}</p>`;
      }
    }

    return serialized.trim() || "<p>&#160;</p>";
  } catch (error) {
    console.error("Sanitization failed, falling back to basic cleanup", error);
    return stripUnsafeMarkup(content).trim() || "<p>&#160;</p>";
  }
}
