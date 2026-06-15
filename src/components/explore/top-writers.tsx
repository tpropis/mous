"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, PenLine, Star } from "lucide-react";
import { AnonAvatar } from "@/components/anon-avatar";
import type { Profile } from "@/lib/types";
import { nameToSlug } from "@/lib/anon";
import { cn, formatCompact } from "@/lib/utils";

/** Accent ring colors for the top three ranks. */
const RANK_ACCENT: Record<number, string> = {
  1: "text-neon-amber",
  2: "text-neon-blue",
  3: "text-neon-rose",
};

/**
 * Leaderboard of the most-read anonymous writers. Only the pen name and the
 * abstract avatar are ever shown — never a real name.
 */
export function TopWriters({ writers }: { writers: Profile[] }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {writers.map((writer, i) => {
        const rank = i + 1;
        const stats = writer.stats;
        return (
          <motion.li
            key={writer.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.4,
              delay: Math.min(i * 0.04, 0.3),
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ y: -3 }}
          >
            <Link
              href={`/profile/${nameToSlug(writer.anonymous_name)}`}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
            >
              {/* Rank */}
              <span
                className={cn(
                  "w-6 shrink-0 text-center text-lg font-black tabular-nums",
                  RANK_ACCENT[rank] ?? "text-muted-foreground/50",
                )}
              >
                {rank}
              </span>

              <AnonAvatar
                seed={writer.avatar_style}
                name={writer.anonymous_name}
                size={44}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold leading-tight transition-colors group-hover:text-primary">
                  {writer.anonymous_name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {formatCompact(stats?.total_reads ?? 0)} reads
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-neon-amber text-neon-amber" />
                    {(stats?.average_rating ?? 0).toFixed(1)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <PenLine className="h-3.5 w-3.5" />
                    {formatCompact(stats?.stories ?? 0)} stories
                  </span>
                </div>
              </div>
            </Link>
          </motion.li>
        );
      })}
    </ol>
  );
}
