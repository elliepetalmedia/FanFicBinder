import { Link } from "wouter";
import { GuideLinks } from "@/components/public/GuideLinks";
import { UrlEntryCta } from "@/components/public/UrlEntryCta";
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
        <p>
          FanFicBinder does not send the file to Kindle for you. It creates the EPUB on your device. Delivery is the separate, approved Amazon step that follows export.
        </p>
      </PublicSection>

      <UrlEntryCta
        title="Converting another story?"
        description="Paste a story or chapter URL to start a new binder in the main converter, then send the fresh EPUB to Kindle."
        inputLabel="Story or chapter URL"
      />

      <PublicSection title="Simple checklist">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Download the EPUB from FanFicBinder.</li>
          <li>Open an approved Send to Kindle path from Amazon.</li>
          <li>Upload the EPUB and wait for conversion.</li>
          <li>Open the delivered book from your Kindle library.</li>
        </ol>
      </PublicSection>

      <PublicSection title="Choose a Send to Kindle path">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Web uploader:</strong> Use this when you are already on a computer and want to send the downloaded EPUB file directly.
          </li>
          <li>
            <strong>Kindle app:</strong> Use this when the EPUB is already on your phone or tablet and you want to share it to Kindle from that device.
          </li>
          <li>
            <strong>Approved email:</strong> Use this only from an email address you have approved in your Amazon account for Send to Kindle. If the sending address is not approved, Amazon will not deliver the file.
          </li>
        </ul>
        <p>
          Whichever path you choose, send the EPUB file itself, not a zip, a screenshot, or a link to the story page. Amazon converts the EPUB during delivery, so the library copy is the converted version, not the original file.
        </p>
      </PublicSection>

      <PublicSection title="If the book does not appear">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Wait for conversion to finish, then sync your Kindle or Kindle app and check the Library, not just the Home screen.</li>
          <li>Check your library filters. A delivered book can be hidden by a filter for downloaded items, docs, or a specific collection.</li>
          <li>If you used email, check that the sending address is approved in your Amazon account and that you sent to the correct Kindle email address.</li>
          <li>If the book appears with the wrong title, author, or cover, fix the metadata in FanFicBinder and export again, rather than editing the delivered copy.</li>
        </ol>
      </PublicSection>

      <PublicSection title="If delivery looks wrong">
        <p>
          Regenerate the EPUB with a simpler title, smaller cover image, or more conservative formatting. That reduces the chances of library-side confusion after Amazon converts the file.
        </p>
        <p>
          If formatting still looks wrong after delivery, start with the <Link href="/guides/epub-to-ereader" className="text-primary hover:text-primary/80">EPUB to e-reader guide</Link> to check whether the problem is the EPUB itself or the Kindle conversion step. For a full story workflow, start with the <Link href="/guides/fanfiction-to-epub" className="text-primary hover:text-primary/80">fanfiction to EPUB guide</Link> or the <Link href="/guides/ao3-to-epub" className="text-primary hover:text-primary/80">AO3 to EPUB guide</Link>.
        </p>
      </PublicSection>

      <PublicSection title="Common questions">
        <p>
          <strong>Can I send an EPUB by USB instead?</strong> Kindle delivery through Send to Kindle is the path this guide covers, because it keeps the book in your Kindle library across devices. USB transfer is a different workflow and is not the same as a Send to Kindle delivery.
        </p>
        <p>
          <strong>Why does Amazon convert the EPUB?</strong> Kindle uses its own reading format internally. Send to Kindle converts the EPUB you upload so it displays consistently in the Kindle library and apps.
        </p>
        <p>
          <strong>What if I only want to read on a phone?</strong> You can still use Send to Kindle and open the book in a Kindle app, or use the EPUB directly in Apple Books or another reading app. The <Link href="/guides/read-fanfiction-offline" className="text-primary hover:text-primary/80">read fanfiction offline guide</Link> compares those paths.
        </p>
      </PublicSection>

      <GuideLinks currentPath={seoRoutes.sendEpubToKindle.path} />
    </PublicPageShell>
  );
}
