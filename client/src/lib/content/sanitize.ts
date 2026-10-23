import { escapeXml } from "@/lib/chapter";

const SAFE_ELEMENTS = new Set([
  "a", "abbr", "b", "blockquote", "br", "cite", "code", "dd", "del", "div", "dl", "dt",
  "em", "figcaption", "figure", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img",
  "li", "ol", "p", "pre", "q", "s", "small", "span", "strong", "sub", "sup", "table",
  "tbody", "td", "tfoot", "th", "thead", "tr", "u", "ul",
]);

const DROP_WITH_CONTENT = new Set([
  "base", "button", "canvas", "embed", "form", "frame", "frameset", "head", "iframe", "input",
  "link", "math", "meta", "noscript", "object", "script", "select", "style", "svg", "template", "textarea",
]);

const GLOBAL_ATTRIBUTES = new Set(["class", "dir", "lang", "title"]);
const ELEMENT_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(["href"]),
  img: new Set(["alt", "height", "src", "width"]),
  ol: new Set(["start"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan", "scope"]),
};

function escapedPlainText(content: string): string {
  const escaped = escapeXml(content.trim());
  return escaped ? `<p>${escaped.replace(/\r?\n/g, "<br />")}</p>` : "<p>&#160;</p>";
}

export function isSafeContentUrl(value: string, elementName: string, attributeName: string): boolean {
  const compact = value.replace(/[\u0000-\u0020\u007f]+/g, "");
  if (attributeName === "src" && elementName === "img") {
    return /^(?:https?:|data:image\/(?:png|gif|jpe?g|webp);base64,)/i.test(compact);
  }
  if (attributeName === "href" && elementName === "a") {
    return /^(?:https?:|mailto:|tel:|#|\/|\.\.?\/)/i.test(compact);
  }
  return false;
}

export function sanitizeContent(content: string): string {
  if (typeof DOMParser === "undefined" || typeof XMLSerializer === "undefined") {
    return escapedPlainText(content);
  }

  try {
    const doc = new DOMParser().parseFromString(`<body>${content}</body>`, "text/html");
    const body = doc.body;

    body.querySelectorAll("*").forEach((element) => {
      const elementName = element.localName.toLowerCase();
      if (DROP_WITH_CONTENT.has(elementName)) {
        element.remove();
        return;
      }
      if (!SAFE_ELEMENTS.has(elementName)) {
        element.replaceWith(...Array.from(element.childNodes));
        return;
      }

      const allowedAttributes = ELEMENT_ATTRIBUTES[elementName] || new Set<string>();
      Array.from(element.attributes).forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const allowed = GLOBAL_ATTRIBUTES.has(name) || allowedAttributes.has(name);
        const isUrl = name === "href" || name === "src";
        if (!allowed || (isUrl && !isSafeContentUrl(attribute.value, elementName, name))) {
          element.removeAttribute(attribute.name);
        }
      });
    });

    body.querySelectorAll("img").forEach((image) => {
      if (!image.hasAttribute("alt")) image.setAttribute("alt", "");
    });

    const serializer = new XMLSerializer();
    const serialized = Array.from(body.childNodes)
      .map((node) => serializer.serializeToString(node))
      .join("")
      .trim();
    return serialized || "<p>&#160;</p>";
  } catch (error) {
    console.error("Sanitization failed; exporting escaped plain text", error);
    return escapedPlainText(content);
  }
}
