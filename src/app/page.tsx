import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Eye,
  Ghost,
  Lock,
  PenLine,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingStories } from "@/components/landing/floating-stories";
import { StoryCard } from "@/components/story/story-card";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";
import { BRAND, CATEGORIES } from "@/lib/constants";
import { getFeaturedStories } from "@/lib/queries";

const FEATURES = [
  {
    icon: Ghost,
    title: "Write anonymously",
    body: "A generated pen name and an abstract avatar are all anyone sees. No real name. No email. No face.",
  },
  {
    icon: Star,
    title: "Get reads and reviews",
    body: "Real engagement — reactions, emotional ratings, and reviews — without ever exposing who you are.",
  },
  {
    icon: ShieldCheck,
    title: "Build reputation, stay hidden",
    body: "Earn badges, streaks, and rankings. Become known for your stories, never for your identity.",
  },
  {
    icon: Compass,
    title: "Explore by mood & place",
    body: "Browse by category, mood, length, or region. Find the stories that match exactly how you feel.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Claim an anonymous identity",
    body: "Pick a generated pen name like “Midnight Witness.” Your login email stays private forever.",
  },
  {
    n: "02",
    title: "Write the thing you still think about",
    body: "Use the editor and its prompts to say what happened. Set how true it is and how visible your location should be.",
  },
  {
    n: "03",
    title: "Receive real engagement",
    body: "Reads, reactions, reviews, and rankings roll in — to your story, not your name.",
  },
];

export default async function LandingPage() {
  // Featured stories now come from the async read layer (falls back to mock data).
  const featured = await getFeaturedStories();
  const trendingCategories = CATEGORIES.slice(0, 12);

  return (
    <div className="relative">
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        {/* gradient + grid backdrop */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-faint bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] opacity-30" />
          <div className="absolute left-1/2 top-[-10%] h-[480px] w-[680px] -translate-x-1/2 rounded-full bg-neon-violet/20 blur-[120px]" />
          <div className="absolute right-[5%] top-[20%] h-[320px] w-[320px] rounded-full bg-neon-rose/15 blur-[120px]" />
          <div className="absolute bottom-0 left-[5%] h-[320px] w-[320px] rounded-full bg-neon-blue/10 blur-[120px]" />
        </div>

        <FloatingStories />

        {/* hero nav */}
        <div className="container relative flex h-20 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
              <Link href="/feed">Read Stories</Link>
            </Button>
            <Button asChild variant="glass" size="sm">
              <Link href="/auth">Sign in</Link>
            </Button>
          </div>
        </div>

        <div className="container relative flex flex-col items-center py-20 text-center sm:py-28">
          <Reveal>
            <Badge variant="glass" className="mb-6 px-4 py-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-neon-violet" />
              Anonymous stories from real people
            </Badge>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="max-w-4xl text-balance text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
              Stories
              <span className="text-gradient-brand"> without </span>
              names.
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
              Write real personal stories — confessions, wild nights, lessons,
              heartbreaks, the moments you can&apos;t stop thinking about. Receive
              reads, reactions, and reviews. Your name never shows.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="brand" size="lg" className="group">
                <Link href="/write">
                  <PenLine className="h-5 w-5" />
                  Start Writing
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="glass" size="lg">
                <Link href="/feed">
                  <BookOpen className="h-5 w-5" />
                  Read Stories
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4 text-neon-teal" /> No public names
              </span>
              <span className="inline-flex items-center gap-2">
                <Eye className="h-4 w-4 text-neon-blue" /> No public emails
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-neon-violet" /> No exact location
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------- Features */}
      <section className="container py-20">
        <SectionHeading
          align="center"
          eyebrow="Why MOUS"
          title="Everything you'd want from a writing platform. None of the exposure."
          description="People write honestly here because their identity is hidden. The engagement is real — the names are not."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- Featured stories */}
      <section className="container py-20">
        <SectionHeading
          eyebrow="Featured"
          title="Stories people couldn't stop reading"
          description="A glimpse of what gets written when no one knows it's you."
          href="/feed"
          hrefLabel="Open the feed"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 6).map((story, i) => (
            <StoryCard key={story.id} story={story} index={i} variant="featured" />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------- Trending categories */}
      <section className="border-y border-border/60 bg-card/20 py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Trending"
            title="Find your corner of the human experience"
            href="/explore"
            hrefLabel="Explore all"
          />
          <div className="mt-10 flex flex-wrap gap-3">
            {trendingCategories.map((cat, i) => (
              <Reveal key={cat.name} delay={Math.min(i * 0.03, 0.3)}>
                <Link
                  href={`/explore?category=${encodeURIComponent(cat.name)}`}
                  className="group flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition-all hover:border-primary/50 hover:bg-accent"
                >
                  <span className="text-base">{cat.emoji}</span>
                  {cat.name}
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ How it works */}
      <section className="container py-20">
        <SectionHeading
          align="center"
          eyebrow="How it works"
          title="From a private thought to real engagement"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.08}>
              <div className="relative h-full rounded-2xl border border-border bg-card p-7">
                <span className="text-5xl font-black text-transparent [-webkit-text-stroke:1px_hsl(var(--border))]">
                  {step.n}
                </span>
                <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- Trust */}
      <section className="container py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-background p-8 sm:p-12">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-neon-violet/10 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-2">
              <div>
                <Badge variant="glass" className="mb-4">
                  <ShieldCheck className="h-3.5 w-3.5 text-neon-teal" />
                  Privacy by design
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight">
                  Your name stays hidden. Your story does not.
                </h2>
                <p className="mt-4 text-muted-foreground">
                  MOUS never displays your real name or email anywhere public. Your
                  account login is private. Your public identity is a pen name you
                  choose. Locations are fuzzy by default — city, state, region, or
                  nothing at all.
                </p>
                <Button asChild variant="outline" className="mt-6">
                  <Link href="/privacy">
                    Read our privacy approach
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <ul className="grid gap-3 self-center">
                {[
                  "Real emails are never exposed through public queries",
                  "No real names anywhere on the platform",
                  "No exact location sharing by default",
                  "Row-level security on every table",
                  "Report, block, and content-warning tools built in",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card/50 p-4"
                  >
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-neon-teal" />
                    <span className="text-sm text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------- Final CTA */}
      <section className="container pb-28 pt-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-neon-violet/15 via-background to-neon-rose/10 px-6 py-16 text-center sm:py-20">
            <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:40px_40px] opacity-20" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
                Write what you could never post.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                The best stories are usually the ones we almost never tell. Tell
                yours. Nobody needs your name.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild variant="brand" size="lg">
                  <Link href="/write">
                    <PenLine className="h-5 w-5" />
                    Start your first story
                  </Link>
                </Button>
                <Button asChild variant="glass" size="lg">
                  <Link href="/missions">
                    <Compass className="h-5 w-5" />
                    Accept a Story Mission
                  </Link>
                </Button>
              </div>
              <p className="mt-8 text-sm italic text-muted-foreground">
                &ldquo;{BRAND.taglines[3]}&rdquo;
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
