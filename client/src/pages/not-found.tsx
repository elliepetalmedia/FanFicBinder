import { Link } from "wouter";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";

export default function NotFound() {
  return (
    <PublicPageShell
      eyebrow="Not Found"
      title="That page is not in the binder"
      description="The link may be old, mistyped, or moved. These pages can get you back to the useful parts of FanFicBinder."
    >
      <PublicSection title="Where to go next">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link className="rounded-lg border border-border p-4 hover:border-primary/70 transition-colors" href="/">
            <span className="font-bold text-foreground">Open the binder</span>
            <span className="block text-sm text-muted-foreground mt-1">Add chapters and export EPUB or Reader Mode HTML.</span>
          </Link>
          <Link className="rounded-lg border border-border p-4 hover:border-primary/70 transition-colors" href="/faq">
            <span className="font-bold text-foreground">Read the FAQ</span>
            <span className="block text-sm text-muted-foreground mt-1">Troubleshoot fetching, export, and e-reader workflows.</span>
          </Link>
          <Link className="rounded-lg border border-border p-4 hover:border-primary/70 transition-colors" href="/guides/web-fiction-to-epub">
            <span className="font-bold text-foreground">Web fiction to EPUB</span>
            <span className="block text-sm text-muted-foreground mt-1">Learn the basic conversion workflow.</span>
          </Link>
          <Link className="rounded-lg border border-border p-4 hover:border-primary/70 transition-colors" href="/guides/reader-mode-html">
            <span className="font-bold text-foreground">Reader Mode HTML</span>
            <span className="block text-sm text-muted-foreground mt-1">Use read-aloud tools and speech apps.</span>
          </Link>
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}
