import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { GuideLinks } from "@/components/public/GuideLinks";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { publicGuideRouteList, seoRoutes } from "@/lib/seo";
import { useSEO } from "@/hooks/useSEO";

export default function GuidesHub() {
  useSEO(seoRoutes.guidesHub);

  const [query, setQuery] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
    setQuery(value);
  }, []);

  const filteredGuides = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return publicGuideRouteList;
    }

    return publicGuideRouteList.filter((route) =>
      `${route.navLabel} ${route.description} ${route.llmSummary}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <PublicPageShell
      route={seoRoutes.guidesHub}
      eyebrow="Guides"
      title="FanFicBinder Guides and Troubleshooting"
      description="Browse answer-focused guides for fanfiction to EPUB, web serial workflows, Reader Mode HTML, offline reading, Kindle delivery, and blocked fetch recovery."
    >
      <PublicSection title="Find the closest workflow">
        <p>
          These guides are organized around the real questions readers ask: how to turn fanfiction into EPUB, how to read stories offline, when Reader Mode HTML is better than EPUB, and what to do when a source page blocks automated fetching.
        </p>
        <div className="rounded-xl border border-border bg-card/60 p-4">
          <label htmlFor="guides-search" className="block text-sm font-medium text-foreground mb-2">
            Search guides
          </label>
          <Input
            id="guides-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="fanfiction to epub, kindle, manual entry, reader mode..."
            className="bg-background"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {filteredGuides.length} guide{filteredGuides.length === 1 ? "" : "s"} matched.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {filteredGuides.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className="rounded-xl border border-border bg-card/70 p-5 transition-colors hover:border-primary/60 hover:bg-card"
            >
              <p className="text-lg font-semibold text-foreground">{route.navLabel}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{route.description}</p>
            </Link>
          ))}
        </div>
      </PublicSection>

      <PublicSection title="Start here if you are deciding between formats">
        <p>
          Use <Link href="/guides/web-fiction-to-epub" className="text-primary hover:text-primary/80">EPUB</Link> when you want a library-friendly file for Kindle, Kobo, Apple Books, or another e-reader. Use <Link href="/guides/reader-mode-html" className="text-primary hover:text-primary/80">Reader Mode HTML</Link> when you mainly want browser read-aloud tools or speech apps.
        </p>
      </PublicSection>

      <PublicSection title="Editorial standard">
        <p>
          Each public guide is written to be directly answerable: a short summary near the top, clear steps, important constraints, and links to adjacent workflows. That keeps the content useful to both readers and retrieval systems that summarize pages.
        </p>
      </PublicSection>

      <GuideLinks />
    </PublicPageShell>
  );
}
