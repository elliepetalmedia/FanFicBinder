import { Link } from "wouter";
import { GuideLinks } from "@/components/public/GuideLinks";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function WebSerialToEpubGuide() {
  useSEO(seoRoutes.webSerialToEpub);

  return (
    <PublicPageShell
      route={seoRoutes.webSerialToEpub}
      eyebrow="Guide"
      title="How to Convert a Web Serial to EPUB"
      description="Build an EPUB from a web serial by fetching readable chapters in order, using sequence fetching when the source exposes stable next-chapter links."
    >
      <PublicSection title="Direct answer">
        <p>
          The cleanest way to convert a web serial to EPUB is to start from a readable chapter page, add chapters in order, and use sequence fetching only when the source has obvious next-chapter navigation. If a later page fails, stop there and continue with Manual Entry instead of losing the binder structure.
        </p>
      </PublicSection>

      <PublicSection title="Sequence fetching works best when">
        <ul className="list-disc pl-6 space-y-2">
          <li>Each chapter has a standard next link.</li>
          <li>The chapter text is exposed as normal readable HTML.</li>
          <li>The site does not rate-limit the sequence immediately.</li>
        </ul>
      </PublicSection>

      <PublicSection title="When to stop the automated path">
        <p>
          Stop if the site returns rate-limit errors, the next page loops incorrectly, or the text extraction becomes unreliable. The <Link href="/guides/when-url-fetching-fails" className="text-primary hover:text-primary/80">URL fetching failure guide</Link> covers the recovery path.
        </p>
      </PublicSection>

      <GuideLinks currentPath={seoRoutes.webSerialToEpub.path} />
    </PublicPageShell>
  );
}
