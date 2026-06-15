"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ToasterProvider } from "@/components/ui/toaster";

/** Client-side context providers mounted once at the app root. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToasterProvider>
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
    </ToasterProvider>
  );
}
