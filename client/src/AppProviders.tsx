import { type ReactNode } from "react";
import { DisclosureBanner } from "@/components/public/DisclosureBanner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <Toaster />
      {children}
      <DisclosureBanner />
    </TooltipProvider>
  );
}
