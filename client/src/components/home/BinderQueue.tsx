import { Book, Download, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Chapter } from "@/lib/chapter";
import { OutputControls } from "./OutputControls";

interface BinderQueueProps {
  chapters: Chapter[];
  totalWords: number;
  outputFormat: "epub" | "reader";
  isExporting: boolean;
  toolStatus: string | null;
  onClearChapters: () => void;
  onRemoveChapter: (id: string) => void;
  onDownload: () => void;
  onOutputFormatChange: (format: "epub" | "reader") => void;
}

export function BinderQueue({
  chapters,
  totalWords,
  outputFormat,
  isExporting,
  toolStatus,
  onClearChapters,
  onRemoveChapter,
  onDownload,
  onOutputFormatChange,
}: BinderQueueProps) {
  return (
    <div className="lg:col-span-2 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif font-bold flex items-center gap-2">
          Binder Queue
          <span className="text-sm font-sans font-normal bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
            {chapters.length}
          </span>
        </h2>
        {chapters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearChapters} className="text-destructive hover:text-destructive/80">
            Clear All
          </Button>
        )}
      </div>

      <Card className="flex-1 border-border bg-card/50 backdrop-blur-sm flex flex-col min-h-[400px] mb-20 lg:mb-0">
        <CardContent className="p-0 flex-1 flex flex-col">
          {chapters.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <div className="w-16 h-16 border-2 border-dashed border-border rounded-full flex items-center justify-center mb-4">
                <Book className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-lg font-medium">Your binder is empty</p>
              <p className="text-sm">Add chapters from URL Fetcher or Manual Entry to start building your ebook.</p>
            </div>
          ) : (
            <ScrollArea className="flex-1 h-[500px]">
              <div className="divide-y divide-border">
                {chapters.map((chapter, index) => (
                  <div key={chapter.id} className="p-4 flex items-center justify-between gap-4 group hover:bg-accent/5 transition-colors">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium font-serif text-foreground break-words">{chapter.title}</h3>
                        <p className="text-xs text-muted-foreground">{chapter.wordCount} words</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveChapter(chapter.id)}
                      className="text-muted-foreground hover:text-destructive transition-all sm:opacity-70 sm:group-hover:opacity-100 shrink-0"
                      aria-label={`Remove ${chapter.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
        {chapters.length > 0 && (
          <div className="p-4 border-t border-border bg-card rounded-b-lg hidden lg:block space-y-4">
            <OutputControls
              outputFormat={outputFormat}
              onOutputFormatChange={onOutputFormatChange}
            />

            <Button
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
              onClick={onDownload}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Download className="mr-2 h-5 w-5" />
              )}
              {toolStatus || `Download ${outputFormat === "epub" ? "EPUB" : "Reader Mode"} (${totalWords.toLocaleString()} words)`}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
