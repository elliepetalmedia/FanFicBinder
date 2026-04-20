import { Link } from "wouter";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function FAQ() {
  useSEO(seoRoutes.faq);

  return (
    <PublicPageShell
      eyebrow="FAQ"
      title="Frequently Asked Questions"
      description="Answers about EPUB export, Reader Mode HTML, URL fetching, manual entry, privacy, and e-reader workflows."
    >
      <PublicSection title="How does FanFicBinder work?">
        <p>
          FanFicBinder creates EPUB files and Reader Mode HTML from web fiction, fanfiction, and articles. You can fetch readable pages or paste chapters manually, then export an offline file for an e-reader or text-to-speech app.
        </p>
        <p>
          Manual text, metadata, cover images, and export generation happen in your browser. URL fetching uses the first-party proxy only for pages you request.
        </p>
      </PublicSection>

      <PublicSection title="How do I fetch chapters?">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a full URL that starts with http:// or https://.</li>
          <li>Choose whether to fetch a single chapter or try sequence fetching.</li>
          <li>Review the binder queue as chapters are added.</li>
        </ol>
        <p className="text-sm text-muted-foreground">
          Sequence fetching works best when a page exposes a clear next-chapter link. AO3 and RoyalRoad are the first-pass optimized paths.
        </p>
      </PublicSection>

      <PublicSection title="What if URL fetching fails?">
        <p>
          Some sites block automated fetching or return pages that are not readable through a proxy. Wattpad commonly blocks this kind of tool. If a fetch fails, open the chapter in your browser, copy the story text, and use Manual Entry.
        </p>
        <p>
          FanFicBinder rejects private/internal URLs, unsupported protocols, non-HTML responses, and oversized responses for safety and predictability.
        </p>
      </PublicSection>

      <PublicSection title="What is Reader Mode?">
        <p>
          Reader Mode generates a clean single-file HTML version of your binder for text-to-speech tools such as Edge Read Aloud, Safari Listen to Page, Speechify, and Voice Dream Reader.
        </p>
        <p>
          For more detail, read the <Link href="/guides/reader-mode-html" className="text-primary hover:text-primary/80">Reader Mode HTML guide</Link>.
        </p>
      </PublicSection>

      <PublicSection title="Can I change the font or layout?">
        <p>
          Yes. Formatting options let you choose a font style, line spacing, and optional drop caps. These settings are baked into the EPUB so most e-readers can use them.
        </p>
      </PublicSection>

      <PublicSection title="How do I move the EPUB to an e-reader?">
        <p>
          Download the EPUB, then transfer it through the method your device supports: Send to Kindle, USB transfer, Apple Books, Files, AirDrop, or a reading app import flow.
        </p>
        <p>
          See the <Link href="/guides/epub-to-ereader" className="text-primary hover:text-primary/80">EPUB to e-reader guide</Link> for device-specific direction.
        </p>
      </PublicSection>

      <PublicSection title="Is my content private?">
        <p>
          EPUB and Reader Mode HTML generation happen on your device. The proxy is used only to fetch URLs you request, and FanFicBinder does not store your binder content. Read the <Link href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</Link> for more detail.
        </p>
      </PublicSection>
    </PublicPageShell>
  );
}
