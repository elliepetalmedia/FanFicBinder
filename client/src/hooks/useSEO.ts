import { useEffect } from "react";
import {
  DEFAULT_OG_IMAGE,
  getCanonicalUrl,
  getSeoJsonLd,
  type SeoRoute,
} from "@/lib/seo";

type SEOProps = Pick<SeoRoute, "title" | "description" | "ogType" | "twitterCard" | "path" | "jsonLd">;

function upsertMeta(selector: string, create: () => HTMLMetaElement, content: string) {
  const existing = document.querySelector(selector);
  if (existing) {
    existing.setAttribute("content", content);
    return;
  }

  const meta = create();
  meta.content = content;
  document.head.appendChild(meta);
}

export function useSEO(route: SEOProps) {
  useEffect(() => {
    const canonicalUrl = getCanonicalUrl(route as SeoRoute);

    document.title = route.title;

    upsertMeta("meta[name=\"description\"]", () => {
      const meta = document.createElement("meta");
      meta.name = "description";
      return meta;
    }, route.description);

    let canonical = document.querySelector("link[rel=\"canonical\"]") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    upsertMeta("meta[property=\"og:title\"]", () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:title");
      return meta;
    }, route.title);

    upsertMeta("meta[property=\"og:description\"]", () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:description");
      return meta;
    }, route.description);

    upsertMeta("meta[property=\"og:type\"]", () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:type");
      return meta;
    }, route.ogType);

    upsertMeta("meta[property=\"og:url\"]", () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:url");
      return meta;
    }, canonicalUrl);

    upsertMeta("meta[property=\"og:image\"]", () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:image");
      return meta;
    }, DEFAULT_OG_IMAGE);

    upsertMeta("meta[name=\"twitter:card\"]", () => {
      const meta = document.createElement("meta");
      meta.name = "twitter:card";
      return meta;
    }, route.twitterCard);

    upsertMeta("meta[name=\"twitter:title\"]", () => {
      const meta = document.createElement("meta");
      meta.name = "twitter:title";
      return meta;
    }, route.title);

    upsertMeta("meta[name=\"twitter:description\"]", () => {
      const meta = document.createElement("meta");
      meta.name = "twitter:description";
      return meta;
    }, route.description);

    upsertMeta("meta[name=\"twitter:image\"]", () => {
      const meta = document.createElement("meta");
      meta.name = "twitter:image";
      return meta;
    }, DEFAULT_OG_IMAGE);

    document.querySelectorAll("script[data-route-json-ld=\"true\"]").forEach((script) => script.remove());

    const jsonLd = getSeoJsonLd(route as SeoRoute);
    if (jsonLd.length > 0) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.routeJsonLd = "true";
      script.textContent = JSON.stringify(jsonLd.length === 1 ? jsonLd[0] : jsonLd);
      document.head.appendChild(script);
    }
  }, [route]);
}
