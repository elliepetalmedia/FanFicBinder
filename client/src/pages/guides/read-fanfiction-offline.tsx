import { Link } from "wouter";
import { GuideLinks } from "@/components/public/GuideLinks";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { UrlEntryCta } from "@/components/public/UrlEntryCta";
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
        <p>
          Download the file once, then you do not need an internet connection to keep reading or listening. That is the whole point: a long fic becomes a book in your library, not a browser tab you have to keep open.
        </p>
      </PublicSection>

      <UrlEntryCta
        title="Read a fic offline"
        description="Paste the first readable chapter URL to continue in the binder, where chapters are collected in order and exported for offline reading."
        placeholder="https://archiveofourown.org/works/..."
        inputLabel="Fanfiction chapter URL"
      />

      <PublicSection title="Choose the format by the final destination">
        <p>
          Choose <Link href="/guides/fanfiction-to-epub" className="text-primary hover:text-primary/80">EPUB</Link> if the final destination is an e-reader library. Choose <Link href="/guides/reader-mode-html" className="text-primary hover:text-primary/80">Reader Mode HTML</Link> if the final destination is Edge Read Aloud, Safari Listen to Page, or another TTS workflow.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Kindle:</strong> Export EPUB, then use <Link href="/guides/send-epub-to-kindle" className="text-primary hover:text-primary/80">Send to Kindle</Link>. Amazon converts the file during delivery.
          </li>
          <li>
            <strong>Kobo, Nook, or USB transfer:</strong> Export EPUB and move the file with USB, Files, or your reading app. The <Link href="/guides/epub-to-ereader" className="text-primary hover:text-primary/80">EPUB to e-reader guide</Link> covers each device path.
          </li>
          <li>
            <strong>Phone or tablet, no e-reader:</strong> EPUB still works in Apple Books and most reading apps, or use Reader Mode HTML in a browser for read-aloud.
          </li>
          <li>
            <strong>Listening instead of reading:</strong> Reader Mode HTML is the better choice, because it is built for browser read-aloud tools and speech apps.
          </li>
        </ul>
      </PublicSection>

      <PublicSection title="Offline workflow">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Add chapters with URL Fetcher or Manual Entry.</li>
          <li>Export EPUB or Reader Mode HTML.</li>
          <li>Move the file to your reading app or device.</li>
          <li>Keep the exported file locally for later reading or listening.</li>
        </ol>
        <p>
          If a source blocks fetching, do not abandon the offline copy. The <Link href="/guides/manual-entry-for-blocked-sites" className="text-primary hover:text-primary/80">Manual Entry workflow</Link> lets you paste the chapter text and keep the same EPUB or Reader Mode output.
        </p>
      </PublicSection>

      <PublicSection title="Common questions">
        <p>
          <strong>Do I need internet after I download the EPUB?</strong> No. Once the EPUB or Reader Mode file is on your device, reading and listening from that file do not need a connection. You only need internet again to fetch new chapters or to send a new file to Kindle.
        </p>
        <p>
          <strong>What if I only have a phone?</strong> You do not need a dedicated e-reader. Apple Books, Kobo, and other reading apps open EPUB files, and Reader Mode HTML opens in a browser for read-aloud.
        </p>
        <p>
          <strong>Can I finish a long fic over several days?</strong> Yes. The exported file keeps its chapter order, title, and author, so it behaves like a book in your library. Your binder also stays on the same device and browser, so you can add later chapters and export again.
        </p>
      </PublicSection>

      <GuideLinks currentPath={seoRoutes.readFanfictionOffline.path} />
    </PublicPageShell>
  );
}
