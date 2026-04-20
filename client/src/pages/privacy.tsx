import { Link } from "wouter";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function Privacy() {
  useSEO(seoRoutes.privacy);

  return (
    <PublicPageShell
      eyebrow="Privacy"
      title="Privacy Policy"
      description="How FanFicBinder handles URL fetching, local file generation, analytics, ads, cookies, and user-provided content."
    >
      <p className="text-sm text-muted-foreground"><strong>Last updated:</strong> April 20, 2026</p>

      <PublicSection title="Local file generation">
        <p>
          FanFicBinder creates EPUB and Reader Mode HTML files in your browser. Manual chapter text, book metadata, and cover images are used to generate your download and are not stored in a FanFicBinder account or content database.
        </p>
      </PublicSection>

      <PublicSection title="URL fetching">
        <p>
          When you use URL Fetcher, the URL you enter is sent to a first-party proxy so the page can be retrieved and returned to your browser. The proxy is intended only to fetch pages you request and rejects private, internal, malformed, oversized, and non-HTML responses.
        </p>
        <p>
          Some sites block automated fetching. When that happens, use Manual Entry instead of trying to bypass a source site's restrictions.
        </p>
      </PublicSection>

      <PublicSection title="Analytics, ads, and cookies">
        <p>
          FanFicBinder uses Google Analytics to understand aggregate site traffic and Google AdSense to show ads. These third-party services may use cookies or similar technologies according to their own policies.
        </p>
        <p>
          The disclosure notice can be dismissed in your browser. Dismissing it stores only a local preference on your device.
        </p>
      </PublicSection>

      <PublicSection title="Contact">
        <p>
          For privacy, legal, or business inquiries, contact <strong>legal@fanficbinder.com</strong>. You can also visit the <Link href="/contact" className="text-primary hover:text-primary/80">Contact page</Link>.
        </p>
      </PublicSection>
    </PublicPageShell>
  );
}
