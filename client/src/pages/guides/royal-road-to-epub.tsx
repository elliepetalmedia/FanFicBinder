import { GuideLinks } from "@/components/public/GuideLinks";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function RoyalRoadToEpubGuide() {
  useSEO(seoRoutes.royalRoadToEpub);

  return (
    <PublicPageShell
      route={seoRoutes.royalRoadToEpub}
      eyebrow="Guide"
      title="Royal Road to EPUB Workflow"
      description="Create an EPUB from readable Royal Road chapters, using sequence fetching when the chapter navigation stays stable and readable."
    >
      <PublicSection title="Direct answer">
        <p>
          Start from a readable Royal Road chapter, add it to FanFicBinder, and use sequence fetching only while the next chapter link keeps resolving cleanly. Export the accumulated chapters as EPUB when the sequence is complete.
        </p>
      </PublicSection>

      <PublicSection title="Why this source is a good fit">
        <p>
          Royal Road chapter pages often expose clear next-chapter navigation, which makes them a reasonable fit for sequence-based collection when the site stays readable through the fetch path.
        </p>
      </PublicSection>

      <PublicSection title="When to switch strategies">
        <p>
          If chapter navigation breaks, if extraction returns the wrong content, or if the source begins rate-limiting, stop and fall back to Manual Entry for the remaining chapters.
        </p>
      </PublicSection>

      <GuideLinks currentPath={seoRoutes.royalRoadToEpub.path} />
    </PublicPageShell>
  );
}
