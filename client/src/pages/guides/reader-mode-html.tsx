import { Link } from "wouter";
import { GuideLinks } from "@/components/public/GuideLinks";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function ReaderModeHtmlGuide() {
  useSEO(seoRoutes.readerModeHtml);

  return (
    <PublicPageShell
      route={seoRoutes.readerModeHtml}
      eyebrow="Guide"
      title="Reader Mode HTML for Text-to-Speech"
      description="Use Reader Mode HTML when you want a simple offline file for browser read-aloud tools, screen readers, speech apps, and listening-first workflows."
    >
      <PublicSection title="What Reader Mode HTML is for">
        <p>
          Reader Mode HTML exports your binder as one clean HTML file with chapter headings and readable document structure. It is useful when you want text-to-speech instead of an EPUB library workflow.
        </p>
        <p>
          EPUB is usually better for Kindle, Kobo, and Apple Books libraries. Reader Mode HTML is usually better for Edge Read Aloud, Safari Listen to Page, and apps that import plain web documents.
        </p>
        <p>
          If your main question is whether to read or listen offline, compare this format with the broader <Link href="/guides/read-fanfiction-offline" className="text-primary hover:text-primary/80">read fanfiction offline</Link> workflow.
        </p>
      </PublicSection>

      <PublicSection title="How to create the file">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Add your chapters with URL Fetcher or Manual Entry.</li>
          <li>Choose Reader Mode as the output format.</li>
          <li>Download the HTML file.</li>
          <li>Open the file in a browser or import it into your speech app.</li>
        </ol>
      </PublicSection>

      <PublicSection title="Best listening workflow">
        <p>
          On desktop, open the file in Microsoft Edge and start Read Aloud from the address bar or context menu. On iPhone or iPad, try Safari Listen to Page if your device supports it.
        </p>
        <p>
          If a speech app has trouble with an EPUB file, export Reader Mode HTML instead. The simpler structure often gives read-aloud tools cleaner chapter breaks and fewer navigation artifacts.
        </p>
      </PublicSection>

      <PublicSection title="Privacy and offline use">
        <p>
          FanFicBinder creates the Reader Mode file in your browser. URL fetching only retrieves pages you request, and manual content stays in your local binder. Read the <Link href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</Link> for more detail.
        </p>
      </PublicSection>

      <GuideLinks currentPath="/guides/reader-mode-html" />
    </PublicPageShell>
  );
}
