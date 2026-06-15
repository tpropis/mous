import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Clock, Eye, Star } from "lucide-react";
import { AnonAvatar } from "@/components/anon-avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SectionHeading } from "@/components/common/section-heading";
import { StoryCard } from "@/components/story/story-card";
import { ReactionBar } from "@/components/story/reaction-bar";
import {
  CategoryBadge,
  ContentWarning,
  MoodBadge,
  StoryLocation,
  TruthBadge,
} from "@/components/story/story-meta";
import { ReadingProgress } from "@/components/story/reading-progress";
import { ContentGate } from "@/components/story/content-gate";
import { StoryActions } from "@/components/story/story-actions";
import { ReviewSection } from "@/components/story/review-section";
import { WriteYourVersion } from "@/components/story/write-your-version";
import { getRelatedStories, getReviews, getStory } from "@/lib/queries";
import { REVIEW_DIMENSIONS } from "@/lib/constants";
import type { ReviewSummary, Story } from "@/lib/types";
import { nameToSlug } from "@/lib/anon";
import { formatCompact, timeAgo, truncate } from "@/lib/utils";

interface StoryPageProps {
  params: { id: string };
}

const ARTICLE_ID = "story-body";

/** Pull the matching review-summary average for a REVIEW_DIMENSIONS entry. */
function dimensionScore(summary: ReviewSummary, key: string): number {
  // Constants use "writing_score" etc.; the summary stores "writing" etc.
  const field = key.replace(/_score$/, "") as keyof ReviewSummary;
  const value = summary[field];
  return typeof value === "number" ? value : 0;
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const story = await getStory(params.id);
  if (!story) return { title: "Story not found · MOUS" };
  return {
    title: `${story.title} · MOUS`,
    description: truncate(story.excerpt, 160),
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const story = await getStory(params.id);
  if (!story) notFound();

  const author = story.author;
  const reviews = await getReviews(story.id);
  const related = await getRelatedStories(story);
  const paragraphs = story.body.split("\n").filter((p) => p.trim().length > 0);
  const summary = story.review_summary;

  return (
    <article id={ARTICLE_ID} className="relative pb-24">
      {/* reading progress pinned to the top */}
      <ReadingProgress targetId={ARTICLE_ID} />

      {/* ambient backdrop */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden">
        <div className="absolute left-1/2 top-[-30%] h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-neon-violet/15 blur-[140px]" />
      </div>

      <div className="container max-w-3xl pt-10 sm:pt-16">
        {/* ---------------------------------------------------------- Header */}
        <header className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={story.category} />
            <MoodBadge mood={story.mood} />
            <TruthBadge truthType={story.truth_type} />
            <ContentWarning story={story} />
          </div>

          <h1 className="text-balance text-3xl font-black leading-[1.1] tracking-tight sm:text-5xl">
            {story.title}
          </h1>

          {/* meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-muted-foreground">
            <Link
              href={`/profile/${nameToSlug(author?.anonymous_name ?? "anonymous")}`}
              className="group inline-flex items-center gap-2.5"
            >
              <AnonAvatar
                seed={author?.avatar_style ?? story.author_id}
                name={author?.anonymous_name}
                size={40}
              />
              <span className="font-medium text-foreground/90 transition-colors group-hover:text-primary">
                {author?.anonymous_name ?? "Anonymous"}
              </span>
            </Link>
            <span aria-hidden>·</span>
            <span>{timeAgo(story.created_at)}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {story.reading_minutes ?? 1} min read
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatCompact(story.view_count)} views
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {formatCompact(story.read_count)} reads
            </span>
            <StoryLocation story={story} />
          </div>
        </header>

        <Separator className="my-8" />

        {/* ------------------------------------------------------------ Body */}
        {story.content_warning ? (
          <ContentGate
            label={story.content_warning_label ?? "This story may be hard to read."}
          >
            <StoryProse paragraphs={paragraphs} />
          </ContentGate>
        ) : (
          <StoryProse paragraphs={paragraphs} />
        )}

        {/* ---------------------------------------------------- Reactions */}
        <div className="mt-12 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            How did this land?
          </h2>
          {story.reactions && (
            <ReactionBar storyId={story.id} initial={story.reactions} />
          )}
          <StoryActions storyId={story.id} title={story.title} />
        </div>

        {/* ------------------------------------------------ Review summary */}
        {summary && summary.count > 0 && (
          <div className="mt-12 rounded-2xl border border-border bg-card/50 p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
              <div className="flex shrink-0 flex-col items-center text-center">
                <span className="text-5xl font-black tabular-nums text-foreground">
                  {summary.average.toFixed(1)}
                </span>
                <div className="mt-2 flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={
                        summary.average >= n - 0.25
                          ? "h-4 w-4 fill-neon-amber text-neon-amber"
                          : "h-4 w-4 text-muted-foreground/30"
                      }
                    />
                  ))}
                </div>
                <span className="mt-1 text-xs text-muted-foreground">
                  {formatCompact(summary.count)}{" "}
                  {summary.count === 1 ? "review" : "reviews"}
                </span>
              </div>

              {/* per-dimension bars */}
              <div className="flex-1 space-y-3">
                {REVIEW_DIMENSIONS.map((d) => {
                  const score = dimensionScore(summary, d.key);
                  return (
                    <div key={d.key} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-sm text-muted-foreground">
                        {d.label}
                      </span>
                      <Progress
                        value={(score / 5) * 100}
                        className="h-2 flex-1"
                      />
                      <span className="w-8 shrink-0 text-right text-sm font-medium tabular-nums">
                        {score.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------- Review list */}
        <div className="mt-14">
          <ReviewSection
            storyId={story.id}
            reviews={reviews}
            summary={summary}
          />
        </div>

        {/* ----------------------------------------------- Write your version */}
        <div className="mt-16">
          <WriteYourVersion />
        </div>
      </div>

      {/* ----------------------------------------------------- Related grid */}
      {related.length > 0 && (
        <section className="container mt-20">
          <SectionHeading
            eyebrow="Keep reading"
            title="Stories in the same key"
            href="/feed"
            hrefLabel="Open the feed"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {related.map((s: Story, i: number) => (
              <StoryCard key={s.id} story={s} index={i} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

/** Serif reading column — splits the body into paragraphs. */
function StoryProse({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="story-prose mx-auto max-w-2xl">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
