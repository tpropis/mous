import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BookOpen,
  Eye,
  Flame,
  Gem,
  Ghost,
  Heart,
  Lock,
  MapPin,
  Moon,
  Sparkles,
  Star,
  TrendingUp,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { AnonAvatar } from "@/components/anon-avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { SectionHeading } from "@/components/common/section-heading";
import { StoryCard } from "@/components/story/story-card";
import { FollowButton } from "@/components/profile/follow-button";
import { BADGES } from "@/lib/data";
import { getProfileByName, getStoriesByAuthor } from "@/lib/queries";
import { slugToName } from "@/lib/anon";
import { formatCompact } from "@/lib/utils";

/** Map badge icon names to concrete lucide icons (no dynamic require). */
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
};

interface PageProps {
  params: { anonymousName: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await getProfileByName(slugToName(params.anonymousName));
  if (!profile) return { title: "Writer not found" };
  return {
    title: profile.anonymous_name,
    description:
      profile.bio ??
      `Anonymous stories by ${profile.anonymous_name} on MOUS.`,
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const profile = await getProfileByName(slugToName(params.anonymousName));
  if (!profile) notFound();

  const stories = await getStoriesByAuthor(profile.id);
  const stats = profile.stats;

  // Show a small, deterministic selection of badges as "earned".
  const earnedBadges = BADGES.slice(0, 6);

  const joined = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const statItems = stats
    ? [
        { label: "Stories", value: formatCompact(stats.stories) },
        { label: "Reads", value: formatCompact(stats.total_reads) },
        { label: "Views", value: formatCompact(stats.total_views) },
        { label: "Avg rating", value: stats.average_rating.toFixed(1) },
        { label: "Followers", value: formatCompact(stats.followers) },
        { label: "Day streak", value: formatCompact(stats.streak_days) },
      ]
    : [];

  return (
    <div className="relative">
      {/* ambient header glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 overflow-hidden">
        <div className="absolute left-1/2 top-[-30%] h-[360px] w-[600px] -translate-x-1/2 rounded-full bg-neon-violet/15 blur-[120px]" />
      </div>

      <div className="container py-10 sm:py-14">
        {/* ----------------------------------------------------- Header */}
        <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <AnonAvatar
            seed={profile.avatar_style}
            name={profile.anonymous_name}
            size={96}
            className="ring-2 ring-primary/20"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              {profile.anonymous_name}
            </h1>
            {profile.bio && (
              <p className="mt-2 max-w-2xl text-muted-foreground">{profile.bio}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>Joined {joined}</span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-neon-teal" />
                Anonymous — no real identity is shown.
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <FollowButton
              profileId={profile.id}
              anonymousName={profile.anonymous_name}
            />
          </div>
        </header>

        {/* ------------------------------------------------------- Stats */}
        {statItems.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {statItems.map((s) => (
              <Card key={s.label} className="bg-card/40 p-4 text-center">
                <p className="text-2xl font-black tracking-tight">{s.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* ------------------------------------------------------ Badges */}
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Badges earned
          </h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {earnedBadges.map((badge) => {
              const Icon = BADGE_ICONS[badge.icon] ?? Sparkles;
              return (
                <Badge
                  key={badge.id}
                  variant="glass"
                  className="gap-1.5 px-3 py-1.5"
                  title={badge.description}
                >
                  <Icon className="h-3.5 w-3.5 text-neon-violet" />
                  {badge.name}
                </Badge>
              );
            })}
          </div>
        </section>

        {/* ----------------------------------------------------- Stories */}
        <section className="mt-12">
          <SectionHeading
            eyebrow="Stories"
            title={`Stories by ${profile.anonymous_name}`}
          />
          {stories.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {stories.map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState
                icon={Ghost}
                title="No stories yet"
                description={`${profile.anonymous_name} hasn't published anything yet. Check back soon.`}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
