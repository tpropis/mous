"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Snippets that drift through the hero background like anonymous confessions. */
const SNIPPETS = [
  { text: "I never told anyone about that summer…", mood: "🌅" },
  { text: "She left a twenty for a drink she never ordered.", mood: "🌃" },
  { text: "I forgive him. I just got tired of carrying it.", mood: "🥹" },
  { text: "Nine buttons. It's not many. But I started.", mood: "🏠" },
  { text: "Revenge is best served as a formatted document.", mood: "💼" },
  { text: "Forty minutes in the driveway, hand on the gear shift.", mood: "🌒" },
  { text: "The biggest mistakes feel like relief.", mood: "🤫" },
  { text: "I miss a person who never existed.", mood: "🕳️" },
];

const POSITIONS = [
  { left: "4%", top: "12%", delay: 0, duration: 11, rotate: -5 },
  { left: "72%", top: "8%", delay: 1.2, duration: 13, rotate: 4 },
  { left: "12%", top: "62%", delay: 2.1, duration: 12, rotate: 3 },
  { left: "80%", top: "58%", delay: 0.6, duration: 14, rotate: -4 },
  { left: "44%", top: "78%", delay: 1.8, duration: 12.5, rotate: 2 },
  { left: "58%", top: "30%", delay: 2.6, duration: 13.5, rotate: -3 },
  { left: "24%", top: "34%", delay: 0.9, duration: 12, rotate: 5 },
  { left: "88%", top: "82%", delay: 2.2, duration: 11.5, rotate: -2 },
];

/**
 * Ambient, non-interactive background for the hero. Anonymous story cards float
 * and breathe behind the headline. Hidden from assistive tech and pointer events.
 */
export function FloatingStories({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {SNIPPETS.map((snippet, i) => {
        const pos = POSITIONS[i % POSITIONS.length];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0, 0.55, 0.55, 0],
              y: [20, -10, -10, 20],
            }}
            transition={{
              duration: pos.duration,
              delay: pos.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ left: pos.left, top: pos.top, rotate: `${pos.rotate}deg` }}
            className="absolute hidden w-56 rounded-xl glass p-3.5 shadow-xl sm:block"
          >
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>{snippet.mood}</span>
              <span>Anonymous</span>
            </div>
            <p className="text-xs leading-snug text-foreground/70">
              {snippet.text}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
