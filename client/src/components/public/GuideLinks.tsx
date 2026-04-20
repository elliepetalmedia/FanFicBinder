import { Link } from "wouter";

const guideLinks = [
  { href: "/guides/web-fiction-to-epub", label: "Web fiction to EPUB" },
  { href: "/guides/reader-mode-html", label: "Reader Mode HTML" },
  { href: "/guides/epub-to-ereader", label: "EPUB to e-reader" },
];

export function GuideLinks({ currentPath }: { currentPath?: string }) {
  return (
    <nav aria-label="Related guides" className="border border-border rounded-lg p-4 bg-card/50">
      <p className="text-sm font-bold text-foreground mb-3">Related guides</p>
      <div className="flex flex-col sm:flex-row gap-2">
        {guideLinks.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className={`text-sm rounded-md border px-3 py-2 transition-colors ${
              guide.href === currentPath
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-muted-foreground hover:text-primary hover:border-primary/60"
            }`}
          >
            {guide.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
