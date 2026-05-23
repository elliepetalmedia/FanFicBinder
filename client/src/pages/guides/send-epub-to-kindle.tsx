import { GuideLinks } from "@/components/public/GuideLinks";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function SendEpubToKindleGuide() {
  useSEO(seoRoutes.sendEpubToKindle);

  return (
    <PublicPageShell
      route={seoRoutes.sendEpubToKindle}
      eyebrow="Guide"
      title="How to Send an EPUB to Kindle"
      description="Export the EPUB from FanFicBinder and deliver it to Kindle with Amazon's approved Send to Kindle workflow."
    >
      <PublicSection title="Direct answer">
        <p>
          After exporting an EPUB from FanFicBinder, use Amazon's Send to Kindle app, web uploader, or approved email workflow. Amazon handles the conversion during delivery, so the file should appear in your Kindle library after processing.
        </p>
      </PublicSection>

      <PublicSection title="Simple checklist">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Download the EPUB from FanFicBinder.</li>
          <li>Open an approved Send to Kindle path from Amazon.</li>
          <li>Upload the EPUB and wait for conversion.</li>
          <li>Open the delivered book from your Kindle library.</li>
        </ol>
      </PublicSection>

      <PublicSection title="If delivery looks wrong">
        <p>
          Regenerate the EPUB with a simpler title, smaller cover image, or more conservative formatting. That reduces the chances of library-side confusion after Amazon converts the file.
        </p>
      </PublicSection>

      <GuideLinks currentPath={seoRoutes.sendEpubToKindle.path} />
    </PublicPageShell>
  );
}
