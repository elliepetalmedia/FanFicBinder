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
          This is the one source where FanFicBinder does whole-work import, not just chapter-by-chapter fetching. You see the title, author, chapter count, and the first chapters before anything is imported, so you can catch a wrong work early.
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
          If the work is very long, import in one pass and check the imported chapter count against the preview count before you export. A missing chapter is easier to spot by comparing those counts than by reading through the finished EPUB.
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
          Manual Entry always adds a chapter to the end of the binder, and there is no way to move a chapter afterward. That matters for the next section: do not use Manual Entry to fill a gap in the middle of a binder that already contains later chapters.
        </p>
      </PublicSection>

      <PublicSection title="If a chapter in the middle fails to import">
        <p>
          For example, if chapters 1 and 3 import but chapter 2 fails, manually adding chapter 2 gives the wrong order: 1, 3, 2. The binder queue lets you remove a chapter, but it has no reordering controls, so do not add a missing middle chapter that way.
        </p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>First, check the binder queue. If every missing chapter comes after every chapter already in the binder, because the import stopped rather than skipping ahead, use Resume Import or Import All. It skips chapters already in the binder and appends the remaining chapters in manifest order, so the order stays correct.</li>
          <li>If a later chapter is already in the binder, start a new binder and import the whole work again, in case the failure was temporary, such as a rate limit. If the same chapter still fails, export the partial work without it rather than inserting it out of order.</li>
          <li>If you already added a missing chapter manually, remove every chapter that should come after it, then fetch those later chapters one by one in order with URL Fetcher, so they land after the manual chapter. Do not run Import All after a manual addition: a manual chapter has no source URL for the importer to skip, so Import All will try that chapter again and can add a duplicate.</li>
        </ol>
      </PublicSection>

      <PublicSection title="Common questions">
        <p>
          <strong>Do I need an AO3 account?</strong> No, for publicly accessible works. Whole-work import works from a public work or chapter URL. Login-restricted works are not supported by this path.
        </p>
        <p>
          <strong>Can I stop a long import halfway?</strong> Yes. Stop any time and keep the chapters that already arrived. Your binder stays on the same device and browser, so you can continue from there with Resume Import. Do not manually add the missing chapters first, or they will land at the end of the binder instead of in their correct place.
        </p>
        <p>
          <strong>What if the chapter list looks wrong?</strong> Do not export yet. Check that you pasted a work or chapter URL for the correct work, not a search, bookmark, or series page, then preview again before importing.
        </p>
      </PublicSection>

      <GuideLinks currentPath={seoRoutes.ao3ToEpub.path} />
    </PublicPageShell>
  );
}
