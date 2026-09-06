import { Link } from "wouter";
import { GuideLinks } from "@/components/public/GuideLinks";
import { UrlEntryCta } from "@/components/public/UrlEntryCta";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function SaveWebFictionForEreaderGuide() {
  useSEO(seoRoutes.saveWebFictionForEreader);

  return (
    <PublicPageShell
      route={seoRoutes.saveWebFictionForEreader}
      eyebrow="Guide"
      title="Best Way to Save Web Fiction for an E-reader"
      description="Build a clean EPUB with stable metadata so web fiction is easier to manage on Kindle, Kobo, Apple Books, and other e-reader apps."
    >
      <PublicSection title="Direct answer">
        <p>
          The best way to save web fiction for an e-reader is to export a clean EPUB with a sensible title, author name, chapter order, and optional cover image. That gives the reading app or device the metadata it needs for a stable library entry.
        </p>
      </PublicSection>

      <UrlEntryCta
        title="Start an e-reader EPUB"
        description="Paste the first readable chapter URL to continue in the binder, where the EPUB is assembled with stable title, author, and chapter order."
        inputLabel="Story or chapter URL"
      />

      <PublicSection title="Why EPUB is the right default">
        <p>
          EPUB is easier to transfer and catalog than a pile of open browser tabs or copied documents. It keeps the chapter order intact and works across most reading apps and e-readers.
        </p>
      </PublicSection>

      <PublicSection title="Next step after export">
        <p>
          Once the file is ready, follow the <Link href="/guides/epub-to-ereader" className="text-primary hover:text-primary/80">EPUB to e-reader guide</Link> or the <Link href="/guides/send-epub-to-kindle" className="text-primary hover:text-primary/80">Send EPUB to Kindle guide</Link>.
        </p>
      </PublicSection>

      <GuideLinks currentPath={seoRoutes.saveWebFictionForEreader.path} />
    </PublicPageShell>
  );
}
