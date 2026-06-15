import Link from "next/link";
import { ArrowRight, Compass, Sparkles, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StoryCard } from "@/components/story/story-card";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import { EmptyState } from "@/components/common/empty-state";
import { TopWriters } from "@/components/explore/top-writers";
import { BRAND, CATEGORIES, MOODS } from "@/lib/constants";
import { getStories, getTopWriters } from "@/lib/queries";

/** Read a possibly-array search param as a single string. */
function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Moods we spotlight in the "Stories by mood" showcase. */
const SHOWCASE_MOODS = ["Funny", "Sad", "Hopeful"] as const;

interface ExplorePageProps {
  searchParams: {
    category?: string | string[];
  };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const activeCategory = single(searchParams.category);

  // Fetch everything from the async read layer in parallel for speed:
  // optional deep-linked category grid, each mood showcase, and top writers.
  const [categoryStories, moodShowcases, topWriters] = await Promise.all([
    // When deep-linked with ?category=, surface a filtered grid up top.
    activeCategory ? getStories({ category: activeCategory }) : Promise.resolve([]),
    Promise.all(SHOWCASE_MOODS.map((moodName) => getStories({ mood: moodName }))),
    getTopWriters(8),
  ]);

  // Map each showcase mood to its (capped) story list, keyed by mood name.
  const storiesByMood = new Map(
    SHOWCASE_MOODS.map((moodName, i) => [moodName, moodShowcases[i].slice(0, 3)]),
  );

  return (
    <div className="relative">
      {/* ------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        {/* gradient + grid backdrop, echoing the landing hero */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-faint bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] opacity-30" />
          <div className="absolute left-1/2 top-[-30%] h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-neon-violet/20 blur-[120px]" />
          <div className="absolute right-[8%] top-[10%] h-[280px] w-[280px] rounded-full bg-neon-teal/10 blur-[120px]" />
        </div>

        <div className="container py-16 sm:py-20">
          <Reveal>
            <Badge variant="glass" className="mb-5 px-4 py-1.5 text-xs">
              <Compass className="h-3.5 w-3.5 text-neon-violet" />
              Find your corner of the human experience
            </Badge>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="max-w-3xl text-balance text-4xl font-black tracking-tight sm:text-6xl">
              <span className="text-gradient-brand">Explore</span> stories without
              names.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            {/* Rotating-tagline subcopy — pulls from the brand tagline set. */}
            <p className="mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
              {BRAND.taglines[2]} Browse by category, mood, or the writers people
              can&apos;t stop reading.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------- Filtered category results */}
      {activeCategory && (
        <section className="container py-14">
          <SectionHeading
            eyebrow="Filtered"
            title={`${activeCategory} stories`}
            description={`Everything tagged ${activeCategory}.`}
            href="/feed"
            hrefLabel="Open the full feed"
          />
          {categoryStories.length > 0 ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {categoryStories.slice(0, 9).map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <EmptyState
                icon={Compass}
                title="No stories here yet"
                description={`Nobody has written under ${activeCategory} yet. Be the first.`}
                action={
                  <Button asChild variant="brand" className="rounded-full">
                    <Link href="/write">Write one</Link>
                  </Button>
                }
              />
            </div>
          )}
        </section>
      )}

      {/* ------------------------------------------------------ Category grid */}
      <section className="container py-16">
        <Reveal>
          <SectionHeading
            eyebrow="Categories"
            title="What do you want to read about?"
            description="Every category is a different slice of real life. Pick one and dive in."
          />
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat.name} delay={Math.min(i * 0.02, 0.3)}>
              <Link
                href={`/feed?category=${encodeURIComponent(cat.name)}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10"
              >
                <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                  {cat.emoji}
                </span>
                <h3 className="mt-3 flex items-center gap-1.5 font-semibold transition-colors group-hover:text-primary">
                  {cat.name}
                  <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {cat.blurb}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- Moods rail */}
      <section className="border-y border-border/60 bg-card/20 py-16">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Moods"
              title="Read for the feeling you're chasing"
              description="Match a story to exactly how you feel right now."
            />
          </Reveal>
          {/* Horizontal scroller — hidden scrollbar, edge-faded for polish. */}
          <div className="no-scrollbar mask-fade-b mt-8 flex gap-3 overflow-x-auto pb-2">
            {MOODS.map((mood) => (
              <Link
                key={mood.name}
                href={`/feed?mood=${encodeURIComponent(mood.name)}`}
                className="group flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium transition-all hover:border-primary/50 hover:bg-accent"
              >
                <span className="text-base">{mood.emoji}</span>
                <span className={mood.color}>{mood.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Top writers */}
      <section className="container py-16">
        <Reveal>
          <SectionHeading
            eyebrow="Leaderboard"
            title="Top writers"
            description="The most-read anonymous voices on MOUS. Known for their stories, never their names."
          />
        </Reveal>
        <div className="mt-10">
          {topWriters.length > 0 ? (
            <TopWriters writers={topWriters} />
          ) : (
            <EmptyState
              icon={Trophy}
              title="No writers ranked yet"
              description="The leaderboard fills as stories get read."
            />
          )}
        </div>
      </section>

      {/* --------------------------------------------------- Stories by mood */}
      <section className="border-t border-border/60 py-16">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="By mood"
              title="A taste of every feeling"
              description="A couple of standout stories from a handful of moods."
            />
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {SHOWCASE_MOODS.map((moodName) => {
              const meta = MOODS.find((m) => m.name === moodName);
              // Pull the pre-fetched (capped) stories for this mood showcase.
              const stories = storiesByMood.get(moodName) ?? [];
              return (
                <div
                  key={moodName}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <span className="text-lg">{meta?.emoji}</span>
                      <span className={meta?.color}>{moodName}</span>
                    </h3>
                    <Link
                      href={`/feed?mood=${encodeURIComponent(moodName)}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      See all
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  {stories.length > 0 ? (
                    <div className="space-y-1">
                      {stories.map((story, i) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          index={i}
                          variant="compact"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="px-3 py-6 text-sm text-muted-foreground">
                      No {moodName.toLowerCase()} stories yet.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Final CTA */}
      <section className="container pb-24 pt-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-neon-violet/15 via-background to-neon-rose/10 px-6 py-14 text-center">
            <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:40px_40px] opacity-20" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance text-3xl font-black tracking-tight sm:text-4xl">
                Found nothing quite like your story?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Then write it. Nobody needs your name.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild variant="brand" size="lg" className="rounded-full">
                  <Link href="/write">
                    <Sparkles className="h-5 w-5" />
                    Start writing
                  </Link>
                </Button>
                <Button asChild variant="glass" size="lg" className="rounded-full">
                  <Link href="/feed">Open the feed</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
