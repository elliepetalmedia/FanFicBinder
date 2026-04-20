import { Link } from "wouter";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function About() {
  useSEO(seoRoutes.about);

  return (
    <PublicPageShell
      eyebrow="About"
      title="About FanFicBinder"
      description="FanFicBinder is a privacy-minded browser tool from Ellie Petal Media for turning long-form web reading into portable files."
    >
      <PublicSection title="Why this exists">
        <p>
          FanFicBinder was built for readers who prefer long stories on e-readers, tablets, and read-aloud tools instead of endless browser tabs. The goal is simple: collect chapters, clean up the reading format, and export a file you control.
        </p>
        <p>
          The app supports readable web fiction pages, fanfiction, articles, and fully manual text entry. When a site blocks automated fetching, manual entry keeps the workflow dependable.
        </p>
      </PublicSection>

      <PublicSection title="How it handles your content">
        <p>
          EPUB and Reader Mode HTML generation happen in your browser. The first-party proxy is used only when you ask FanFicBinder to fetch a URL, and the binder content is not stored as an account, library, or database record.
        </p>
        <p>
          For details about analytics, ads, URL fetching, and cookies, read the <Link href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</Link>.
        </p>
      </PublicSection>

      <PublicSection title="Where to start">
        <p>
          Open the <Link href="/" className="text-primary hover:text-primary/80">binder tool</Link> to add chapters, or read the <Link href="/guides/web-fiction-to-epub" className="text-primary hover:text-primary/80">web fiction to EPUB guide</Link> for a step-by-step workflow.
        </p>
      </PublicSection>
    </PublicPageShell>
  );
}
