import { Link } from "wouter";
import { GuideLinks } from "@/components/public/GuideLinks";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function ReadFanfictionOfflineGuide() {
  useSEO(seoRoutes.readFanfictionOffline);

  return (
    <PublicPageShell
      route={seoRoutes.readFanfictionOffline}
      eyebrow="Guide"
      title="How to Read Fanfiction Offline"
      description="Turn fanfiction into EPUB or Reader Mode HTML so you can read or listen offline instead of staying inside a browser tab."
    >
      <PublicSection title="Direct answer">
        <p>
          To read fanfiction offline, first convert the chapters into a portable file. EPUB is the better default for Kindle, Kobo, Apple Books, and other e-readers. Reader Mode HTML is better when you want browser read-aloud tools or a speech app.
        </p>
      </PublicSection>

      <PublicSection title="Choose the format by the final destination">
        <p>
          Choose <Link href="/guides/fanfiction-to-epub" className="text-primary hover:text-primary/80">EPUB</Link> if the final destination is an e-reader library. Choose <Link href="/guides/reader-mode-html" className="text-primary hover:text-primary/80">Reader Mode HTML</Link> if the final destination is Edge Read Aloud, Safari Listen to Page, or another TTS workflow.
        </p>
      </PublicSection>

      <PublicSection title="Offline workflow">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Add chapters with URL Fetcher or Manual Entry.</li>
          <li>Export EPUB or Reader Mode HTML.</li>
          <li>Move the file to your reading app or device.</li>
          <li>Keep the exported file locally for later reading or listening.</li>
        </ol>
      </PublicSection>

      <GuideLinks currentPath={seoRoutes.readFanfictionOffline.path} />
    </PublicPageShell>
  );
}
