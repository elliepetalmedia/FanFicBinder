import { type ReactNode } from "react";
import { DisclosureBanner } from "@/components/public/DisclosureBanner";
import { Toaster } from "@/components/ui/toaster";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <Toaster />
      {children}
      <DisclosureBanner />
    </>
  );
}
