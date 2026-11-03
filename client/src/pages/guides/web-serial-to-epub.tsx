import { Link } from "wouter";
import { GuideLinks } from "@/components/public/GuideLinks";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { UrlEntryCta } from "@/components/public/UrlEntryCta";
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
        <p>
          A web serial is different from a single short story: the value is the reading order, the chapter list, and a file you can finish over weeks. That is why this guide focuses on order and progress first, and on speed second.
        </p>
      </PublicSection>

      <UrlEntryCta
        title="Convert a web serial chapter"
        description="Paste the first readable chapter URL to continue in the binder, where chapters are collected in order and exported as EPUB."
        placeholder="https://example.com/story/chapter-1"
        inputLabel="Web serial chapter URL"
      />

      <PublicSection title="Sequence fetching works best when">
        <ul className="list-disc pl-6 space-y-2">
          <li>Each chapter has a standard next link.</li>
          <li>The chapter text is exposed as normal readable HTML.</li>
          <li>The site does not rate-limit the sequence immediately.</li>
        </ul>
      </PublicSection>

      <PublicSection title="Keep a long serial in order">
        <ol className="list-decimal pl-6 space-y-2">
          <li>Start from chapter 1, or from the earliest chapter you want to keep, so the binder does not start mid-story.</li>
          <li>Check the chapter titles after each fetch. A wrong title usually means the extractor picked up navigation, comments, or an unrelated page.</li>
          <li>Set the book title and author before you export, so a long serial is easy to find later in your e-reader library.</li>
          <li>Export a partial EPUB if you want to start reading now. You can keep the binder on the same device and browser and add later chapters, then export again.</li>
        </ol>
        <p>
          For a source with its own whole-work import, use that path instead. The <Link href="/guides/ao3-to-epub" className="text-primary hover:text-primary/80">AO3 to EPUB guide</Link> covers chapter preview and whole-work import, and the <Link href="/guides/royal-road-to-epub" className="text-primary hover:text-primary/80">Royal Road to EPUB guide</Link> covers sequence-friendly Royal Road chapters.
        </p>
      </PublicSection>

      <PublicSection title="When to stop the automated path">
        <p>
          Stop if the site returns rate-limit errors, the next page loops incorrectly, or the text extraction becomes unreliable. The <Link href="/guides/when-url-fetching-fails" className="text-primary hover:text-primary/80">URL fetching failure guide</Link> covers the recovery path.
        </p>
        <p>
          Do not push through a rate limit by retrying the same sequence repeatedly. Copy the remaining chapters with <Link href="/guides/manual-entry-for-blocked-sites" className="text-primary hover:text-primary/80">Manual Entry</Link> instead. The EPUB output is the same, and the chapter order is the part worth protecting.
        </p>
      </PublicSection>

      <PublicSection title="Common questions">
        <p>
          <strong>How many chapters can I bind?</strong> There is no single chapter limit in the guide, because the practical limit is the source: readable pages, stable navigation, and whether the site rate-limits a long sequence. If a sequence starts failing, switch to Manual Entry for the rest rather than forcing the automated path.
        </p>
        <p>
          <strong>What if the next-chapter link breaks halfway through?</strong> Keep the chapters already in the binder, export them if you want to start reading, and add the remaining chapters manually in order. Do not restart the whole serial unless the chapter order is actually wrong.
        </p>
        <p>
          <strong>Can I read a serial offline on Kindle or Kobo?</strong> Yes, once the EPUB is exported. The <Link href="/guides/epub-to-ereader" className="text-primary hover:text-primary/80">EPUB to e-reader guide</Link> and the <Link href="/guides/send-epub-to-kindle" className="text-primary hover:text-primary/80">Send EPUB to Kindle guide</Link> cover the transfer step after export.
        </p>
      </PublicSection>

      <GuideLinks currentPath={seoRoutes.webSerialToEpub.path} />
    </PublicPageShell>
  );
}
