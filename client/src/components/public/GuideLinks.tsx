import { Link } from "wouter";
import { getRelatedGuideRoutes } from "@/lib/seo";

export function GuideLinks({ currentPath }: { currentPath?: string }) {
  // Related guides come from centralized metadata in seo.ts, not a
  // hardcoded list here. Guide pages show 4 to 6 contextual guides,
  // excluding the current page, and the hub link stays prominent.
  // Without a current page, the hub case, all public guides are shown.
  const guideLinks = getRelatedGuideRoutes(currentPath);

  return (
    <nav aria-label="Related guides" className="border border-border rounded-lg p-4 bg-card/50">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-foreground">Related guides</p>
        <Link href="/guides" className="text-sm text-primary hover:text-primary/80">
          Browse all guides
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {guideLinks.map((guide) => (
          <Link
            key={guide.path}
            href={guide.path}
            className="text-sm rounded-md border px-3 py-2 transition-colors border-border text-muted-foreground hover:text-primary hover:border-primary/60"
          >
            {guide.navLabel}
          </Link>
        ))}
      </div>
    </nav>
  );
}
