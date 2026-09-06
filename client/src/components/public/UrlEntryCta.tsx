import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildConverterHandoffUrl } from "@/lib/converterHandoff";

interface UrlEntryCtaProps {
  /** Short heading shown above the input. */
  title?: string;
  /** One-line supporting copy. */
  description?: string;
  /** Input placeholder tailored to the guide. */
  placeholder?: string;
  /** Screen-reader/context label for the input. */
  inputLabel?: string;
}

function isLikelyValidUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Reusable story-URL entry that hands off into the homepage converter.
 * Renders no conversion logic of its own; submit navigates to `/?url=…`.
 */
export function UrlEntryCta({
  title = "Start your conversion",
  description = "Paste a story or chapter URL to continue in the binder, where chapters are fetched, ordered, and exported.",
  placeholder = "https://archiveofourown.org/...",
  inputLabel = "Story or chapter URL",
}: UrlEntryCtaProps) {
  const [, navigate] = useLocation();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    try {
      navigate(buildConverterHandoffUrl(value));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enter a valid URL.");
    }
  };

  const trimmed = value.trim();
  const showInvalid = trimmed.length > 0 && !isLikelyValidUrl(trimmed);

  return (
    <div
      data-url-entry-cta="true"
      className="rounded-lg border border-border bg-card/50 p-4 space-y-3"
    >
      <div className="space-y-1">
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <Label htmlFor="guide-url-entry">{inputLabel}</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="guide-url-entry"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            className="bg-input border-border text-foreground"
            aria-invalid={showInvalid}
            inputMode="url"
          />
          <Button
            type="submit"
            disabled={!isLikelyValidUrl(trimmed)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          >
            Continue in the Binder
          </Button>
        </div>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {error ?? (showInvalid
            ? "Enter a full URL starting with http:// or https://."
            : "The URL is carried into the main converter — nothing is fetched from this page.")}
        </p>
      </form>
    </div>
  );
}
