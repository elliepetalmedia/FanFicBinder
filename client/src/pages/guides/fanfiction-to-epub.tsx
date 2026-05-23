import { Link } from "wouter";
import { GuideLinks } from "@/components/public/GuideLinks";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function FanfictionToEpubGuide() {
  useSEO(seoRoutes.fanfictionToEpub);

  return (
    <PublicPageShell
      route={seoRoutes.fanfictionToEpub}
      eyebrow="Guide"
      title="How to Convert Fanfiction to EPUB"
      description="Use FanFicBinder to turn readable fanfiction chapters into an EPUB for offline reading, with Manual Entry as the clean fallback when a site blocks fetching."
    >
      <PublicSection title="Direct answer">
        <p>
          The simplest way to convert fanfiction to EPUB is to add readable chapter pages one by one, confirm the chapter text looks correct, and export the finished binder as EPUB. When a source blocks automated fetching, switch to Manual Entry instead of forcing a brittle workaround.
        </p>
      </PublicSection>

      <PublicSection title="Best workflow">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Open the chapter in a normal browser tab and confirm the story text is readable.</li>
          <li>Paste the URL into FanFicBinder, or paste copied chapter text into Manual Entry.</li>
          <li>Add each chapter in reading order.</li>
          <li>Set the title, author, and optional cover image, then export EPUB.</li>
        </ol>
      </PublicSection>

      <PublicSection title="When Manual Entry is the better path">
        <p>
          Some fanfiction sites make chapter text hard to extract through a proxy, especially when the content is hidden behind app shells, rate limits, or blocking rules. In those cases, Manual Entry is the dependable fallback because it keeps the final EPUB workflow the same.
        </p>
        <p>
          See <Link href="/guides/manual-entry-for-blocked-sites" className="text-primary hover:text-primary/80">Manual Entry for blocked sites</Link> if you need the exact fallback steps.
        </p>
      </PublicSection>

      <GuideLinks currentPath={seoRoutes.fanfictionToEpub.path} />
    </PublicPageShell>
  );
}
