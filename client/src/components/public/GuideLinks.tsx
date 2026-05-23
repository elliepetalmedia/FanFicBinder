import { Link } from "wouter";
import { publicGuideRouteList, seoRoutes } from "@/lib/seo";

const featuredGuideLinks = [
  seoRoutes.webFictionToEpub,
  seoRoutes.fanfictionToEpub,
  seoRoutes.readerModeHtml,
  seoRoutes.sendEpubToKindle,
  seoRoutes.fetchBlocked,
];

export function GuideLinks({ currentPath }: { currentPath?: string }) {
  const guideLinks = currentPath
    ? featuredGuideLinks
    : publicGuideRouteList;

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
            className={`text-sm rounded-md border px-3 py-2 transition-colors ${
              guide.path === currentPath
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-muted-foreground hover:text-primary hover:border-primary/60"
            }`}
          >
            {guide.navLabel}
          </Link>
        ))}
      </div>
    </nav>
  );
}
