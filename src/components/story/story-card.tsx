"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Clock, Eye, MessageSquare, Star } from "lucide-react";
import { AnonAvatar } from "@/components/anon-avatar";
import { CategoryBadge, ContentWarning, MoodBadge, StoryLocation } from "./story-meta";
import type { Story } from "@/lib/types";
import { formatCompact, timeAgo, cn } from "@/lib/utils";
import { nameToSlug } from "@/lib/anon";

/** Sum of all reactions on a story. */
function totalReactions(story: Story): number {
  if (!story.reactions) return 0;
  return Object.values(story.reactions).reduce((a, b) => a + b, 0);
}

interface StoryCardProps {
  story: Story;
  index?: number;
  variant?: "default" | "featured" | "compact";
}

/**
 * Cinematic, emotionally-weighted story card.
 * Hovering lifts the card and reveals an ambient glow. Featured cards get a
 * larger, gradient-framed treatment for the landing/explore showcases.
 */
export function StoryCard({ story, index = 0, variant = "default" }: StoryCardProps) {
  const author = story.author;
  const reactions = totalReactions(story);

  if (variant === "compact") {
    return (
      <Link
        href={`/story/${story.id}`}
        className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-accent/60"
      >
        <span className="mt-0.5 text-lg font-black text-muted-foreground/40">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold leading-snug group-hover:text-primary">
            {story.title}
          </h4>
          <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{author?.anonymous_name}</span>
            <span>·</span>
            <span>{formatCompact(story.read_count)} reads</span>
          </p>
        </div>
      </Link>
    );
  }

  const isFeatured = variant === "featured";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative h-full",
        isFeatured && "md:col-span-1",
      )}
    >
      <Link href={`/story/${story.id}`} className="block h-full">
        <div
          className={cn(
            "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300",
            "group-hover:border-primary/40 group-hover:shadow-2xl group-hover:shadow-primary/10",
            isFeatured && "p-6",
          )}
        >
          {/* ambient hover glow */}
          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:from-neon-violet/10 group-hover:to-neon-rose/10 group-hover:opacity-100" />

          <div className="relative flex flex-1 flex-col">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <CategoryBadge category={story.category} />
              <MoodBadge mood={story.mood} />
              <ContentWarning story={story} />
            </div>

            <h3
              className={cn(
                "font-bold leading-tight tracking-tight transition-colors group-hover:text-primary",
                isFeatured ? "text-2xl" : "text-xl",
              )}
            >
              {story.title}
            </h3>

            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {story.excerpt}
            </p>

            {/* author + location */}
            <div className="mt-4 flex items-center gap-2.5">
              <AnonAvatar
                seed={author?.avatar_style ?? story.author_id}
                name={author?.anonymous_name}
                size={28}
              />
              <div className="flex min-w-0 flex-1 items-center gap-2 text-xs">
                <span className="truncate font-medium text-foreground/90">
                  {author?.anonymous_name ?? "Anonymous"}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{timeAgo(story.created_at)}</span>
              </div>
              <StoryLocation story={story} />
            </div>

            {/* stats row */}
            <div className="mt-4 flex items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {story.reading_minutes ?? 1} min
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {formatCompact(story.view_count)}
              </span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {formatCompact(story.read_count)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {formatCompact(story.review_summary?.count ?? 0)}
              </span>
              <span className="ml-auto inline-flex items-center gap-1 font-medium text-foreground/80">
                <Star className="h-3.5 w-3.5 fill-neon-amber text-neon-amber" />
                {story.review_summary?.average.toFixed(1) ?? "—"}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
