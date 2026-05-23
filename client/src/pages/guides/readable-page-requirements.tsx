import { GuideLinks } from "@/components/public/GuideLinks";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function ReadablePageRequirementsGuide() {
  useSEO(seoRoutes.readablePageRequirements);

  return (
    <PublicPageShell
      route={seoRoutes.readablePageRequirements}
      eyebrow="Troubleshooting"
      title="What Makes a Page Readable for FanFicBinder"
      description="Readable public HTML chapter pages are the best fit. Login walls, app shells, and non-HTML responses are much more likely to fail."
    >
      <PublicSection title="Direct answer">
        <p>
          A page is a good candidate for FanFicBinder when the chapter text is visible in a normal browser tab, exposed as standard HTML, and not hidden behind a private login wall or a heavy client-side app shell.
        </p>
      </PublicSection>

      <PublicSection title="Good signs">
        <ul className="list-disc pl-6 space-y-2">
          <li>The chapter body is readable without extra clicks or app state.</li>
          <li>The page has a normal article-like structure.</li>
          <li>The next chapter link is visible on the page if you need sequence fetching.</li>
        </ul>
      </PublicSection>

      <PublicSection title="Bad signs">
        <ul className="list-disc pl-6 space-y-2">
          <li>The text is hidden behind a private login or anti-bot wall.</li>
          <li>The response is not a normal HTML page.</li>
          <li>The page mostly renders through a client-side app shell with little source text exposed.</li>
        </ul>
      </PublicSection>

      <GuideLinks currentPath={seoRoutes.readablePageRequirements.path} />
    </PublicPageShell>
  );
}
