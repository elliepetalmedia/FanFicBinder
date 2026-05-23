import { GuideLinks } from "@/components/public/GuideLinks";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function ManualEntryForBlockedSitesGuide() {
  useSEO(seoRoutes.manualEntry);

  return (
    <PublicPageShell
      route={seoRoutes.manualEntry}
      eyebrow="Troubleshooting"
      title="Manual Entry Workflow for Blocked Sites"
      description="Use copied chapter text to keep building EPUB or Reader Mode files when a source website blocks automated fetching."
    >
      <PublicSection title="Direct answer">
        <p>
          Manual Entry is the stable fallback when a site blocks fetching. Open the chapter in your browser, copy the readable story text, paste it into FanFicBinder with a clear chapter title, and continue the binder normally.
        </p>
      </PublicSection>

      <PublicSection title="Why this fallback matters">
        <p>
          It preserves the rest of the workflow. You still get chapter ordering, title and author metadata, optional cover images, EPUB export, and Reader Mode HTML export. Only the chapter ingestion step changes.
        </p>
      </PublicSection>

      <PublicSection title="What to keep consistent">
        <p>
          Use a clean chapter title and paste only the story text you want in the final file. That keeps the binder easier to navigate after export.
        </p>
      </PublicSection>

      <GuideLinks currentPath={seoRoutes.manualEntry.path} />
    </PublicPageShell>
  );
}
