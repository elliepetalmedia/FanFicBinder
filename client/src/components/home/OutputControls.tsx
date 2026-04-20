import { Book, Headphones } from "lucide-react";

interface OutputControlsProps {
  outputFormat: "epub" | "reader";
  onOutputFormatChange: (format: "epub" | "reader") => void;
}

export function OutputControls({ outputFormat, onOutputFormatChange }: OutputControlsProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Choose Output Format
      </span>
      <div className="bg-secondary/20 p-1.5 rounded-lg flex flex-col sm:flex-row gap-1 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => onOutputFormatChange("epub")}
          aria-pressed={outputFormat === "epub"}
          className={`px-5 py-3 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${outputFormat === "epub" ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground hover:bg-background/50"}`}
        >
          <Book className="w-5 h-5" />
          EPUB
        </button>
        <button
          type="button"
          onClick={() => onOutputFormatChange("reader")}
          aria-pressed={outputFormat === "reader"}
          className={`px-5 py-3 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${outputFormat === "reader" ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground hover:bg-background/50"}`}
        >
          <Headphones className="w-5 h-5 flex-shrink-0" />
          <span className="flex flex-col items-start text-left leading-tight min-w-0">
            <span className="truncate w-full">Reader Mode</span>
            <span className="text-xs opacity-90 font-normal truncate w-full">
              Best for Read Aloud apps
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
