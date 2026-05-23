import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { SiteFooter } from "@/components/home/SiteFooter";
import type { SeoRoute } from "@/lib/seo";

function formatLastUpdated(value: string): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

interface PublicPageShellProps {
  route?: SeoRoute;
  title: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
}

export function PublicPageShell({
  route,
  title,
  description,
  eyebrow,
  children,
}: PublicPageShellProps) {
  let breadcrumbItems: Array<{ href: string; label: string }> = [];

  if (route?.path.startsWith("/guides/")) {
    breadcrumbItems = [
      { href: "/", label: "Home" },
      { href: "/guides", label: "Guides" },
      { href: route.path, label: route.breadcrumbLabel },
    ];
  } else if (route) {
    breadcrumbItems = [
      { href: "/", label: "Home" },
      { href: route.path, label: route.breadcrumbLabel },
    ];
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <header className="border-b border-border bg-card/95 py-5 sticky top-0 z-10 backdrop-blur">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Binder
          </Link>
          {breadcrumbItems.length > 0 ? (
            <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-2">
                {breadcrumbItems.map((item, index) => (
                  <li key={item.href} className="flex items-center gap-2">
                    {index > 0 ? <span aria-hidden="true">/</span> : null}
                    {index === breadcrumbItems.length - 1 ? (
                      <span className="text-foreground">{item.label}</span>
                    ) : (
                      <Link href={item.href} className="hover:text-primary transition-colors">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-serif text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-3xl text-base md:text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
          {route ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Last updated {formatLastUpdated(route.lastModified)}
            </p>
          ) : null}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
        <div className="prose-like space-y-8 text-foreground/90 leading-relaxed">
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export function PublicSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold font-serif text-foreground">{title}</h2>
      <div className="space-y-3 text-base leading-relaxed">{children}</div>
    </section>
  );
}
