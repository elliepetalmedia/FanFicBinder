import { Link } from "wouter";
import { GuideLinks } from "@/components/public/GuideLinks";
import { UrlEntryCta } from "@/components/public/UrlEntryCta";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function Ao3ToEpubGuide() {
  useSEO(seoRoutes.ao3ToEpub);

  return (
    <PublicPageShell
      route={seoRoutes.ao3ToEpub}
      eyebrow="Guide"
      title="AO3 to EPUB Workflow"
      description="Import a public AO3 work with chapter preview, then export it as EPUB for offline reading and e-readers."
    >
      <PublicSection title="Direct answer">
        <p>
          Paste an AO3 work or chapter URL into FanFicBinder, preview the detected title, author, and chapter list, then import the whole work in reading order and export it as EPUB.
        </p>
        <p>
          This is the one source where FanFicBinder does whole-work import, not just chapter-by-chapter fetching. You see the chapter list before anything is imported, so you can catch a wrong work, a wrong order, or a missing chapter early.
        </p>
      </PublicSection>

      <UrlEntryCta
        title="Import an AO3 work"
        description="Paste an AO3 work or chapter URL to continue in the binder, where the chapter list is detected before anything is imported."
        placeholder="https://archiveofourown.org/works/..."
        inputLabel="AO3 work or chapter URL"
      />

      <PublicSection title="How whole-work import works">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a public AO3 work or chapter URL.</li>
          <li>Preview the detected title, author, and ordered chapter list.</li>
          <li>Import all chapters in order with visible progress. Stop any time and keep the chapters that already arrived.</li>
          <li>Set the cover and formatting, then export the binder as EPUB.</li>
        </ol>
        <p>
          If the work is very long, import in one pass and check the chapter count against the preview before you export. A missing chapter is much easier to spot in the preview list than after the EPUB is built.
        </p>
      </PublicSection>

      <PublicSection title="When FanFicBinder is the better choice for AO3">
        <p>
          If you only want an unchanged copy of one AO3 work, AO3's own download is the simplest path. Use FanFicBinder when you want something AO3's download does not give you in one step: a custom cover, your choice of font and spacing, Reader Mode HTML for read-aloud tools, or a binder that combines an AO3 work with chapters from another readable source.
        </p>
        <p>
          After export, use the <Link href="/guides/send-epub-to-kindle" className="text-primary hover:text-primary/80">Send EPUB to Kindle guide</Link> for Kindle delivery, or the <Link href="/guides/epub-to-ereader" className="text-primary hover:text-primary/80">EPUB to e-reader guide</Link> for Kobo, Apple Books, and other readers. To read without an e-reader, see the <Link href="/guides/read-fanfiction-offline" className="text-primary hover:text-primary/80">read fanfiction offline guide</Link>.
        </p>
      </PublicSection>

      <PublicSection title="When fetching is blocked">
        <p>
          Whole-work import supports publicly accessible works only. Login-restricted works, adult-consent gates that cannot be confirmed automatically, and rate-limited pages will not import. In those cases, copy the chapter text from your browser and use Manual Entry instead — the EPUB output is the same.
        </p>
        <p>
          If only part of a work imports, keep the chapters that arrived, export a partial EPUB if you want to start reading, and add the remaining chapters with Manual Entry in order. Do not restart the whole import unless the chapter order is actually wrong.
        </p>
      </PublicSection>

      <PublicSection title="Common questions">
        <p>
          <strong>Do I need an AO3 account?</strong> No, for publicly accessible works. Whole-work import works from a public work or chapter URL. Login-restricted works are not supported by this path.
        </p>
        <p>
          <strong>Can I stop a long import halfway?</strong> Yes. Stop any time and keep the chapters that already arrived. Your binder stays on the same device and browser, so you can continue from there.
        </p>
        <p>
          <strong>What if the chapter list looks wrong?</strong> Do not export yet. Check that you pasted a work or chapter URL for the correct work, not a search, bookmark, or series page, then preview again before importing.
        </p>
      </PublicSection>

      <GuideLinks currentPath={seoRoutes.ao3ToEpub.path} />
    </PublicPageShell>
  );
}
