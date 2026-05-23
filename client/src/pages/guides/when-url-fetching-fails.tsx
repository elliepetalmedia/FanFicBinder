import { Link } from "wouter";
import { GuideLinks } from "@/components/public/GuideLinks";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function WhenUrlFetchingFailsGuide() {
  useSEO(seoRoutes.fetchBlocked);

  return (
    <PublicPageShell
      route={seoRoutes.fetchBlocked}
      eyebrow="Troubleshooting"
      title="What to Do When URL Fetching Fails"
      description="Check whether the page is readable, avoid pushing through rate limits, and switch to Manual Entry when a source page blocks automated fetching."
    >
      <PublicSection title="Direct answer">
        <p>
          When URL fetching fails, first confirm the page is a readable public HTML chapter page. If it is not, or if the source begins blocking or rate-limiting the requests, stop and use Manual Entry for the affected chapters.
        </p>
      </PublicSection>

      <PublicSection title="Common causes">
        <ul className="list-disc pl-6 space-y-2">
          <li>The source requires a private login or heavy app shell.</li>
          <li>The response is not standard readable HTML.</li>
          <li>The site rate-limits or blocks the sequence.</li>
          <li>The page is a different document than the story chapter you expected.</li>
        </ul>
      </PublicSection>

      <PublicSection title="Clean fallback">
        <p>
          The reliable fallback is <Link href="/guides/manual-entry-for-blocked-sites" className="text-primary hover:text-primary/80">Manual Entry</Link>. Copy the chapter text from your browser, save it as a custom chapter, and continue building the binder without trying to outsmart the source site.
        </p>
      </PublicSection>

      <GuideLinks currentPath={seoRoutes.fetchBlocked.path} />
    </PublicPageShell>
  );
}
