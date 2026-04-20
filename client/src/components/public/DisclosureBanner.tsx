import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const DISCLOSURE_KEY = "fanficbinder-disclosure-dismissed";

export function DisclosureBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      setIsVisible(localStorage.getItem(DISCLOSURE_KEY) !== "true");
    } catch {
      setIsVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISCLOSURE_KEY, "true");
    } catch {
      // Non-critical: the notice can still be dismissed for this render.
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-[60] mx-auto max-w-3xl rounded-lg border border-border bg-card p-4 shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground leading-relaxed">
          FanFicBinder uses analytics and ads to keep the tool available. Exports are generated in your browser. Read the{" "}
          <Link href="/privacy" className="text-primary hover:text-primary/80 font-medium">
            Privacy Policy
          </Link>
          .
        </p>
        <Button type="button" size="sm" onClick={dismiss} className="shrink-0">
          Got it
        </Button>
      </div>
    </div>
  );
}
