import { GuideLinks } from "@/components/public/GuideLinks";
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
      description="Use readable AO3 chapter pages with FanFicBinder when you want to build your own EPUB workflow, chapter order, and export metadata."
    >
      <PublicSection title="Direct answer">
        <p>
          FanFicBinder works best with readable AO3 chapter pages opened in a normal browser tab. Paste one chapter URL at a time, review the fetched text, and export to EPUB after your chapter list is complete.
        </p>
      </PublicSection>

      <PublicSection title="Why use this workflow">
        <p>
          This path is useful when you want to control chapter order, merge selected chapters into a single file, or set your own title, author, and cover before export.
        </p>
      </PublicSection>

      <PublicSection title="Important constraint">
        <p>
          The reliable signal is page readability, not site branding alone. If the AO3 page is not exposed cleanly through the fetch path, switch to Manual Entry for that chapter and keep the rest of the binder intact.
        </p>
      </PublicSection>

      <GuideLinks currentPath={seoRoutes.ao3ToEpub.path} />
    </PublicPageShell>
  );
}
