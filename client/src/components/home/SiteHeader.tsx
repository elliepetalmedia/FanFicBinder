import { Book } from "lucide-react";
import { Link } from "wouter";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-card py-4 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Book className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight font-serif text-foreground">
                FanFic<span className="text-primary">Binder</span>
              </h1>
            </Link>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/guides" className="text-muted-foreground hover:text-primary transition-colors">
              Guides
            </Link>
            <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
          </nav>
        </div>
        <div className="mt-3 text-sm text-muted-foreground">
          Build your offline reading file, chapter by chapter.
        </div>
      </div>
    </header>
  );
}
