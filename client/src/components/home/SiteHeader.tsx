import { Book } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-card py-4 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Book className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-serif text-foreground">
              FanFic<span className="text-primary">Binder</span>
            </h1>
          </div>
          <div className="text-sm text-muted-foreground hidden sm:block">
            Build your offline reading file, chapter by chapter.
          </div>
        </div>
      </div>
    </header>
  );
}
