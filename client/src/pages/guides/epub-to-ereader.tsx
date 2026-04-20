import { Link } from "wouter";
import { GuideLinks } from "@/components/public/GuideLinks";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function EpubToEreaderGuide() {
  useSEO(seoRoutes.epubToEreader);

  return (
    <PublicPageShell
      eyebrow="Guide"
      title="How to Move an EPUB to an E-reader"
      description="After you export an EPUB from FanFicBinder, use the transfer method that matches your reading device or app."
    >
      <PublicSection title="Kindle">
        <p>
          Kindle devices work best through Amazon Send to Kindle. Download the EPUB from FanFicBinder, then send it through Amazon's Send to Kindle app, web uploader, or approved email address.
        </p>
        <p>
          Amazon converts the EPUB into a Kindle-readable format during delivery. If the file does not appear, check that the book title and file size are reasonable and try again.
        </p>
      </PublicSection>

      <PublicSection title="Kobo, Nook, and USB transfer">
        <p>
          Kobo and many other e-readers can accept EPUB files directly. Connect the device by USB, copy the downloaded EPUB into the device's books folder, eject safely, and let the library rescan.
        </p>
        <p>
          If your device shows the book but formatting looks off, regenerate the EPUB with a simpler font choice and comfortable line spacing.
        </p>
      </PublicSection>

      <PublicSection title="Apple Books and reading apps">
        <p>
          On iPhone, iPad, or Mac, open the downloaded EPUB with Apple Books or share it into your preferred reading app. Many third-party apps also accept EPUB files through Files, AirDrop, or cloud storage.
        </p>
      </PublicSection>

      <PublicSection title="When to use Reader Mode instead">
        <p>
          If your main goal is listening, <Link href="/guides/reader-mode-html" className="text-primary hover:text-primary/80">Reader Mode HTML</Link> may be easier than managing an EPUB library. It gives browser read-aloud tools a single clean document.
        </p>
      </PublicSection>

      <GuideLinks currentPath="/guides/epub-to-ereader" />
    </PublicPageShell>
  );
}
