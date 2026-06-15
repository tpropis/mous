"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shuffle, Sparkles, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EDITOR_PROMPTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PromptGeneratorProps {
  /** Fired when the writer wants to drop the current prompt into their story. */
  onUse?: (prompt: string) => void;
  className?: string;
}

/**
 * Reusable rotating inspirational prompt chip.
 * "New prompt" advances to a random *different* prompt so the shuffle always
 * visibly changes the text; "Use" hands the active prompt to the parent editor.
 */
export function PromptGenerator({ onUse, className }: PromptGeneratorProps) {
  const [index, setIndex] = React.useState(0);
  const prompt = EDITOR_PROMPTS[index];

  const shuffle = React.useCallback(() => {
    setIndex((current) => {
      if (EDITOR_PROMPTS.length < 2) return current;
      // pick any index that isn't the current one so the chip always changes
      let next = current;
      while (next === current) {
        next = Math.floor(Math.random() * EDITOR_PROMPTS.length);
      }
      return next;
    });
  }, []);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card/40 p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-neon-violet" />
        Need a way in?
      </div>

      <div className="mt-3 min-h-[3.5rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={prompt}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-balance font-serif text-lg leading-snug text-foreground/90"
          >
            “{prompt}”
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="glass" size="sm" onClick={shuffle}>
          <Shuffle className="h-3.5 w-3.5" />
          New prompt
        </Button>
        {onUse && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onUse(prompt)}
          >
            <CornerDownLeft className="h-3.5 w-3.5" />
            Use it
          </Button>
        )}
      </div>
    </div>
  );
}
