import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";

export function SeoArticle() {
  return (
    <article className="max-w-3xl mx-auto mt-24 text-muted-foreground font-sans space-y-8">
      <Separator className="bg-border" />
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Read Web Fiction Offline on E-readers</h2>
        <p className="leading-relaxed mb-6">
          FanFicBinder is a fanfiction downloader and web fiction to EPUB tool for readers who want long-form stories on Kindle, Kobo, Apple Books, or another e-reader. Add chapters from readable web pages or paste text manually, then export a clean offline file.
        </p>

        <h3 className="text-xl font-bold text-foreground mb-3">How it Works</h3>
        <p className="leading-relaxed mb-4">
          Most story pages are designed for browsers, not e-readers. FanFicBinder uses readability extraction to remove sidebars, ads, and comments where possible, leaving the chapter text for EPUB packaging.
        </p>
        <p className="leading-relaxed mb-4">
          Use sequence fetching to collect multiple chapters in a row from supported sites such as AO3 or RoyalRoad, with manual entry available when a source blocks automated fetching.
        </p>
        <p className="leading-relaxed mb-4">
          <strong>Reader Mode HTML:</strong> Prefer listening? Export your binder as a simple HTML file optimized for text-to-speech tools such as Edge Read Aloud, Safari Listen to Page, Speechify, or Voice Dream Reader.
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Amazon Kindle (via Send-to-Kindle)</li>
          <li>Apple Books (iPad/iPhone)</li>
          <li>Kobo & Nook</li>
        </ul>

        <h3 className="text-xl font-bold text-foreground mb-3">Why "Bind" Your Fics?</h3>
        <p className="leading-relaxed">
          Offline reading makes long stories easier to finish and keeps your favorite works available when you are away from a connection. EPUB export also gives you better typography, battery life, and organization than endless phone scrolling.
        </p>
            <p className="leading-relaxed mt-4">
              Need help? Read the <Link href="/faq" className="text-primary hover:text-primary/80">FanFicBinder FAQ</Link> for URL fetching, manual entry, reader mode HTML, privacy, and e-reader transfer tips.
            </p>
            <p className="leading-relaxed mt-4">
              For step-by-step help, start with the <Link href="/guides/web-fiction-to-epub" className="text-primary hover:text-primary/80">web fiction to EPUB guide</Link>, the <Link href="/guides/reader-mode-html" className="text-primary hover:text-primary/80">Reader Mode HTML guide</Link>, or the <Link href="/guides/epub-to-ereader" className="text-primary hover:text-primary/80">EPUB to e-reader guide</Link>.
            </p>
          </div>
    </article>
  );
}
