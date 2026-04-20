import { Link } from "wouter";
import { GuideLinks } from "@/components/public/GuideLinks";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function WebFictionToEpubGuide() {
  useSEO(seoRoutes.webFictionToEpub);

  return (
    <PublicPageShell
      eyebrow="Guide"
      title="How to Turn Web Fiction into an EPUB"
      description="A practical workflow for saving long stories, fanfiction, and readable articles as clean EPUB files for offline reading."
    >
      <PublicSection title="Start with the cleanest source you can access">
        <p>
          Open the chapter or article in your browser first. If the page is readable without a login wall or heavy app shell, FanFicBinder can often extract the main text through the URL fetcher.
        </p>
        <p>
          For sites that block automated fetching, use <Link href="/" className="text-primary hover:text-primary/80">Manual Entry</Link>. Copy the chapter text, paste it into a custom chapter, and FanFicBinder will still package it into the same binder.
        </p>
      </PublicSection>

      <PublicSection title="Build the binder chapter by chapter">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a readable story URL into the URL Fetcher, or open the Manual tab.</li>
          <li>Add each chapter in reading order.</li>
          <li>Set a book title, author name, and optional cover image.</li>
          <li>Choose EPUB as the output format and download the finished file.</li>
        </ol>
      </PublicSection>

      <PublicSection title="When sequence fetching helps">
        <p>
          Sequence fetching is useful when supported sites expose a clear next-chapter link. It works best for sources with normal chapter navigation, such as AO3 and RoyalRoad pages that are readable in a browser.
        </p>
        <p>
          If a site rate-limits, blocks the proxy, or returns no readable content, stop the sequence and switch to manual entry. That keeps the binder predictable instead of relying on fragile workarounds.
        </p>
      </PublicSection>

      <PublicSection title="Keep the result e-reader friendly">
        <p>
          Use a concise title, avoid oversized cover images, and keep chapter titles clear. EPUB readers use this metadata for library display, table of contents entries, and search.
        </p>
        <p>
          For transfer steps after download, read the <Link href="/guides/epub-to-ereader" className="text-primary hover:text-primary/80">EPUB to e-reader guide</Link>.
        </p>
      </PublicSection>

      <GuideLinks currentPath="/guides/web-fiction-to-epub" />
    </PublicPageShell>
  );
}
