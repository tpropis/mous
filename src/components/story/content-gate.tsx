"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentGateProps {
  label: string;
  children: React.ReactNode;
}

/**
 * Blurs sensitive story bodies behind a content-warning card until the reader
 * explicitly opts in. Reveal is purely client-side and non-blocking.
 */
export function ContentGate({ label, children }: ContentGateProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative">
      <div
        className={
          revealed
            ? "transition-[filter] duration-500"
            : "pointer-events-none select-none blur-xl transition-[filter] duration-500"
        }
        aria-hidden={!revealed}
      >
        {children}
      </div>

      <AnimatePresence>
        {!revealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-start justify-center pt-16"
          >
            <div className="glass-strong sticky top-32 mx-auto flex max-w-md flex-col items-center rounded-2xl border border-neon-amber/30 p-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-amber/10 text-neon-amber">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Content warning</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {label}
              </p>
              <Button
                variant="brand"
                className="mt-6"
                onClick={() => setRevealed(true)}
              >
                <Eye className="h-4 w-4" />
                Read anyway
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
