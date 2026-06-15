"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { REACTIONS } from "@/lib/constants";
import { toggleReaction } from "@/lib/actions";
import type { ReactionSummary, ReactionType } from "@/lib/types";
import { formatCompact, cn } from "@/lib/utils";

interface ReactionBarProps {
  initial: ReactionSummary;
  /** When provided, toggles persist via the `toggleReaction` server action. */
  storyId?: string;
  className?: string;
}

/**
 * Interactive reaction palette. Clicking a reaction toggles the user's vote with
 * a springy pop + a floating emoji burst. Optimistic — in production each toggle
 * would write to `story_reactions`.
 */
export function ReactionBar({ initial, storyId, className }: ReactionBarProps) {
  const [counts, setCounts] = useState<ReactionSummary>(initial);
  const [active, setActive] = useState<Set<ReactionType>>(new Set());
  const [burst, setBurst] = useState<{ id: number; emoji: string } | null>(null);

  function toggle(type: ReactionType, emoji: string) {
    setActive((prev) => {
      const next = new Set(prev);
      const isOn = next.has(type);
      next.has(type) ? next.delete(type) : next.add(type);
      setCounts((c) => ({ ...c, [type]: Math.max(0, c[type] + (isOn ? -1 : 1)) }));
      if (!isOn) setBurst({ id: Date.now(), emoji });
      // Persist the toggle server-side (fire-and-forget; optimistic UI stands).
      if (storyId) void toggleReaction(storyId, type);
      return next;
    });
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {REACTIONS.map((r) => {
        const isActive = active.has(r.type);
        return (
          <motion.button
            key={r.type}
            onClick={() => toggle(r.type, r.emoji)}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-primary/50 bg-primary/15 text-foreground"
                : "border-border bg-card/50 text-muted-foreground hover:border-foreground/20 hover:text-foreground",
            )}
          >
            <motion.span
              animate={isActive ? { scale: [1, 1.4, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
              className="text-base"
            >
              {r.emoji}
            </motion.span>
            <span className="hidden sm:inline">{r.label}</span>
            <span className="tabular-nums text-xs opacity-80">
              {formatCompact(counts[r.type])}
            </span>

            {/* floating burst on activate */}
            <AnimatePresence>
              {burst && isActive && burst.emoji === r.emoji && (
                <motion.span
                  key={burst.id}
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -40, scale: 1.6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  onAnimationComplete={() => setBurst(null)}
                  className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 text-xl"
                >
                  {r.emoji}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
