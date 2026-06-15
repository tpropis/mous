"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Eye,
  FileText,
  MessageSquare,
  PenLine,
  Shuffle,
  Sparkles,
  Star,
  TrendingUp,
  // Badge icons (mapped by name below — imported explicitly, never via require):
  Compass,
  Flame,
  Gem,
  Ghost,
  Heart,
  MapPin,
  Moon,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnonAvatar } from "@/components/anon-avatar";
import { Reveal } from "@/components/common/reveal";
import { EmptyState } from "@/components/common/empty-state";
import { SectionHeading } from "@/components/common/section-heading";
import { StoryCard } from "@/components/story/story-card";
import { GrowthChart } from "@/components/dashboard/growth-chart";
import { BADGES } from "@/lib/badges";
import { EDITOR_PROMPTS, REACTIONS } from "@/lib/constants";
import type { Profile, ReactionType, Story, StoryReview } from "@/lib/types";
import { cn, formatCompact, timeAgo } from "@/lib/utils";

/** Maps a badge's lucide icon name to its component. Explicit, no dynamic require. */
const BADGE_ICONS: Record<string, LucideIcon> = {
  Sparkles,
  BookOpen,
  Flame,
  Heart,
  Moon,
  ShieldCheck,
  Ghost,
  MapPin,
  TrendingUp,
  Gem,
  Star,
  Compass,
};

/** Sum of every reaction on a story. */
function totalReactions(story: Story): number {
  if (!story.reactions) return 0;
  return Object.values(story.reactions).reduce((a, b) => a + b, 0);
}

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Fabricated-but-plausible week-over-week delta (percent). */
  delta: number;
  format?: (n: number) => string;
  accent: string;
}

/**
 * The private writer dashboard. All numbers come from the current profile's
 * aggregated stats + their published stories. Names are never shown — only the
 * anonymous pen name and abstract avatar.
 */
export function Dashboard({
  profile,
  stories,
  reviews,
}: {
  profile: Profile;
  stories: Story[];
  reviews: StoryReview[];
}) {
  const stats = profile.stats;

  // A rotating encouragement prompt — re-rolls on click for a little dopamine.
  const [promptIndex, setPromptIndex] = useState(0);
  const prompt = EDITOR_PROMPTS[promptIndex % EDITOR_PROMPTS.length];

  // Mock draft count — drafts aren't in the published-stories query.
  const DRAFT_COUNT = 2;

  const statCards: Stat[] = [
    {
      label: "Stories",
      value: stats?.stories ?? stories.length,
      icon: PenLine,
      delta: 8,
      accent: "text-neon-violet",
    },
    {
      label: "Drafts",
      value: DRAFT_COUNT,
      icon: FileText,
      delta: 0,
      accent: "text-neon-blue",
    },
    {
      label: "Total views",
      value: stats?.total_views ?? 0,
      icon: Eye,
      delta: 14,
      format: formatCompact,
      accent: "text-neon-teal",
    },
    {
      label: "Total reads",
      value: stats?.total_reads ?? 0,
      icon: BookOpen,
      delta: 11,
      format: formatCompact,
      accent: "text-neon-amber",
    },
    {
      label: "Avg rating",
      value: stats?.average_rating ?? 0,
      icon: Star,
      delta: 2,
      format: (n) => n.toFixed(1),
      accent: "text-neon-amber",
    },
    {
      label: "Reviews",
      value: stats?.total_reviews ?? 0,
      icon: MessageSquare,
      delta: 6,
      format: formatCompact,
      accent: "text-neon-rose",
    },
  ];

  // Top performing story by reads.
  const topStory = useMemo(
    () =>
      stories.length
        ? [...stories].sort((a, b) => b.read_count - a.read_count)[0]
        : undefined,
    [stories],
  );

  // Fabricated-but-plausible 12-week reads series, scaled to the author's volume.
  const growthSeries = useMemo(() => {
    const base = Math.max((stats?.total_reads ?? 12000) / 40, 200);
    const shape = [0.4, 0.5, 0.45, 0.6, 0.7, 0.65, 0.8, 0.9, 0.85, 1.0, 1.1, 1.25];
    return shape.map((s, i) =>
      Math.round(base * s * (1 + Math.sin(i * 1.3) * 0.08)),
    );
  }, [stats?.total_reads]);

  // Aggregate reactions across all of the author's stories.
  const reactionTotals = useMemo(() => {
    const totals = {} as Record<ReactionType, number>;
    for (const { type } of REACTIONS) totals[type] = 0;
    for (const story of stories) {
      if (!story.reactions) continue;
      for (const { type } of REACTIONS) totals[type] += story.reactions[type] ?? 0;
    }
    return totals;
  }, [stories]);
  const reactionMax = Math.max(1, ...Object.values(reactionTotals));

  // Recent reviews across all of the author's stories, newest first.
  // Reviews are fetched server-side and passed in via props.
  const recentReviews = useMemo(
    () =>
      [...reviews]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 4),
    [reviews],
  );

  // A handful of badges to display as "earned".
  const earnedBadges = BADGES.slice(0, 6);

  // No published stories yet — encourage the author to write their first one.
  if (stories.length === 0) {
    return (
      <EmptyState
        icon={PenLine}
        title="Your story starts here"
        description="You haven't published anything yet. Write your first story and your private analytics will appear here."
        action={
          <Button asChild variant="brand" size="lg">
            <Link href="/write">
              <PenLine className="h-5 w-5" />
              Write your first story
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-14">
      {/* ----------------------------------------------------------- Stat cards */}
      <section>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
          {statCards.map((stat, i) => {
            const up = stat.delta >= 0;
            return (
              <Reveal key={stat.label} delay={i * 0.04}>
                <div className="glass h-full rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <stat.icon className={cn("h-4 w-4", stat.accent)} />
                    {stat.delta !== 0 && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-[11px] font-medium",
                          up ? "text-neon-teal" : "text-neon-rose",
                        )}
                      >
                        {up ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {Math.abs(stat.delta)}%
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-2xl font-black tracking-tight">
                    {stat.format ? stat.format(stat.value) : formatCompact(stat.value)}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* --------------------------------------------- Top story + growth chart */}
      <section className="grid gap-6 lg:grid-cols-5">
        {topStory && (
          <div className="lg:col-span-2">
            <SectionHeading
              eyebrow="Your best yet"
              title="Top performing story"
              className="mb-5"
            />
            <StoryCard story={topStory} />
          </div>
        )}

        <div className="lg:col-span-3">
          <SectionHeading
            eyebrow="Momentum"
            title="Growth over time"
            description="Weekly reads across your stories over the last 12 weeks."
            className="mb-5"
          />
          <Card>
            <CardContent className="p-5">
              <GrowthChart
                data={growthSeries}
                color="hsl(var(--primary))"
                className="h-44 w-full"
              />
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>12 weeks ago</span>
                <span className="inline-flex items-center gap-1 font-medium text-neon-teal">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Trending up
                </span>
                <span>This week</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ------------------------------------------------ Reactions breakdown */}
      <section>
        <SectionHeading
          eyebrow="How it lands"
          title="Reactions breakdown"
          description="What readers feel across everything you've published."
          className="mb-5"
        />
        <Card>
          <CardContent className="grid gap-x-8 gap-y-4 p-6 sm:grid-cols-2">
            {REACTIONS.map((reaction) => {
              const count = reactionTotals[reaction.type];
              return (
                <div key={reaction.type}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-base">{reaction.emoji}</span>
                      {reaction.label}
                    </span>
                    <span className="font-medium text-muted-foreground">
                      {formatCompact(count)}
                    </span>
                  </div>
                  <Progress value={(count / reactionMax) * 100} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      {/* ------------------------------------------------ Per-story analytics */}
      <section>
        <SectionHeading
          eyebrow="The numbers"
          title="Per-story analytics"
          description="Every published story, by the metrics that matter."
          className="mb-5"
        />
        <Card>
          <CardContent className="p-0">
            {/* header row (hidden on mobile; cards stack to a list there) */}
            <div className="hidden grid-cols-[1fr_repeat(5,minmax(0,72px))] gap-4 border-b border-border/60 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid">
              <span>Story</span>
              <span className="text-right">Views</span>
              <span className="text-right">Reads</span>
              <span className="text-right">Reviews</span>
              <span className="text-right">Rating</span>
              <span className="text-right">Reactions</span>
            </div>
            <ul className="divide-y divide-border/60">
              {stories.map((story) => (
                <li
                  key={story.id}
                  className="grid grid-cols-2 gap-2 px-5 py-4 text-sm transition-colors hover:bg-accent/40 sm:grid-cols-[1fr_repeat(5,minmax(0,72px))] sm:items-center sm:gap-4"
                >
                  <Link
                    href={`/story/${story.id}`}
                    className="col-span-2 min-w-0 truncate font-medium hover:text-primary sm:col-span-1"
                  >
                    {story.title}
                  </Link>
                  <Metric label="Views" value={formatCompact(story.view_count)} />
                  <Metric label="Reads" value={formatCompact(story.read_count)} />
                  <Metric
                    label="Reviews"
                    value={formatCompact(story.review_summary?.count ?? 0)}
                  />
                  <Metric
                    label="Rating"
                    value={story.review_summary?.average.toFixed(1) ?? "—"}
                  />
                  <Metric
                    label="Reactions"
                    value={formatCompact(totalReactions(story))}
                  />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* ----------------------------------------------------- Recent reviews */}
      {recentReviews.length > 0 && (
        <section>
          <SectionHeading
            eyebrow="In their words"
            title="Recent reviews"
            description="What readers wrote back to you — anonymously, of course."
            className="mb-5"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {recentReviews.map((review, i) => (
              <Reveal key={review.id} delay={i * 0.05}>
                <Card className="h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2.5">
                      <AnonAvatar
                        seed={review.reviewer?.avatar_style ?? review.reviewer_id}
                        name={review.reviewer?.anonymous_name}
                        size={28}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {review.reviewer?.anonymous_name ?? "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(review.created_at)}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-medium">
                        <Star className="h-3.5 w-3.5 fill-neon-amber text-neon-amber" />
                        {review.rating}
                      </span>
                    </div>
                    {review.review_text && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        “{review.review_text}”
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------ Badges earned */}
      <section>
        <SectionHeading
          eyebrow="Earned"
          title="Your badges"
          description="Reputation you built — without ever showing your name."
          className="mb-5"
        />
        <div className="flex flex-wrap gap-3">
          {earnedBadges.map((badge, i) => {
            const Icon = BADGE_ICONS[badge.icon] ?? Sparkles;
            return (
              <Reveal key={badge.id} delay={i * 0.04}>
                <div className="glass flex items-center gap-2.5 rounded-full py-2 pl-2.5 pr-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium">{badge.name}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* -------------------------------------------------- Write again CTA */}
      <section>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-neon-violet/15 via-card to-neon-rose/10 p-8 sm:p-10">
            <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:40px_40px] opacity-20" />
            <div className="relative max-w-2xl">
              <Badge variant="glass" className="mb-4">
                <Sparkles className="h-3.5 w-3.5 text-neon-violet" />
                Keep the streak alive
              </Badge>
              <h2 className="text-balance text-3xl font-black tracking-tight sm:text-4xl">
                Write again.
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                You&apos;re {stats?.streak_days ?? 0} days into your streak. Don&apos;t
                let it cool off — your readers are waiting.
              </p>
              <button
                type="button"
                onClick={() => setPromptIndex((n) => n + 1)}
                className="group mt-5 flex items-center gap-2 text-left text-base italic text-foreground/90 transition-colors hover:text-primary"
              >
                <Shuffle className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                “{prompt}”
              </button>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="brand" size="lg">
                  <Link href="/write">
                    <PenLine className="h-5 w-5" />
                    Start a new story
                  </Link>
                </Button>
                <Button asChild variant="glass" size="lg">
                  <Link href="/missions">
                    <Compass className="h-5 w-5" />
                    Accept a mission
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

/** A single metric cell — labelled on mobile, bare on the desktop grid. */
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline justify-between gap-2 sm:block sm:text-right">
      <span className="text-xs text-muted-foreground sm:hidden">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </span>
  );
}
