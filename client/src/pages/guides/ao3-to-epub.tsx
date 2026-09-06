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
      </PublicSection>

      <PublicSection title="When fetching is blocked">
        <p>
          Whole-work import supports publicly accessible works only. Login-restricted works, adult-consent gates that cannot be confirmed automatically, and rate-limited pages will not import. In those cases, copy the chapter text from your browser and use Manual Entry instead — the EPUB output is the same.
        </p>
      </PublicSection>

      <GuideLinks currentPath={seoRoutes.ao3ToEpub.path} />
    </PublicPageShell>
  );
}
