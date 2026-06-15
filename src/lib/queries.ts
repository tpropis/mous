/**
 * Live read layer (server-only).
 *
 * Each function reads from Supabase when it's configured, and transparently
 * falls back to the seeded mock data otherwise — so the app runs in both modes
 * with identical return shapes. Server Components await these; client components
 * receive the results as props.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createTypedClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Loosely-typed client for reads. Rows are mapped into the app's own `Story` /
 * `Profile` types (which provide the real type safety) right after fetching.
 */
async function createClient(): Promise<SupabaseClient> {
  return (await createTypedClient()) as unknown as SupabaseClient;
}
import {
  applyFeedFilters,
  getStories as mockGetStories,
  getFeaturedStories as mockFeatured,
  getStory as mockGetStory,
  getRelatedStories as mockRelated,
  getReviews as mockReviews,
  getStoriesByAuthor as mockByAuthor,
  getProfile as mockProfile,
  getTopWriters as mockTopWriters,
  getCurrentProfile as mockCurrentProfile,
  type FeedFilters,
} from "@/lib/data";
import type {
  Profile,
  ReactionSummary,
  ReactionType,
  ReviewSummary,
  Story,
  StoryReview,
} from "@/lib/types";
import { readingTimeMinutes } from "@/lib/utils";

const EMPTY_REACTIONS: ReactionSummary = {
  felt: 0, wild: 0, beautiful: 0, painful: 0,
  funny: 0, unbelievable: 0, say_more: 0, changed_me: 0,
};

/** Columns we always select for a story, including nested aggregates. */
const STORY_SELECT = `
  *,
  author:profiles!stories_author_id_fkey(*),
  story_reactions(reaction_type),
  story_reviews(rating,writing_score,honesty_score,emotion_score,impact_score,entertainment_score)
`;

/** Reduce a list of reaction rows into a per-type summary. */
function summarizeReactions(rows: { reaction_type: string }[]): ReactionSummary {
  const out = { ...EMPTY_REACTIONS };
  for (const r of rows ?? []) {
    const key = r.reaction_type as ReactionType;
    if (key in out) out[key] += 1;
  }
  return out;
}

/** Reduce review rows into averages per dimension + overall. */
function summarizeReviews(rows: any[]): ReviewSummary {
  const count = rows?.length ?? 0;
  if (!count) {
    return { count: 0, average: 0, writing: 0, honesty: 0, emotion: 0, impact: 0, entertainment: 0 };
  }
  const avg = (k: string) =>
    Math.round((rows.reduce((s, r) => s + (r[k] ?? 0), 0) / count) * 10) / 10;
  return {
    count,
    average: avg("rating"),
    writing: avg("writing_score"),
    honesty: avg("honesty_score"),
    emotion: avg("emotion_score"),
    impact: avg("impact_score"),
    entertainment: avg("entertainment_score"),
  };
}

/** Map a raw Supabase story row (with nested data) into the app's Story type. */
function mapStory(row: any): Story {
  return {
    ...row,
    author: row.author ?? undefined,
    reactions: summarizeReactions(row.story_reactions ?? []),
    review_summary: summarizeReviews(row.story_reviews ?? []),
    reading_minutes: readingTimeMinutes(row.body ?? ""),
  } as Story;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function getStories(filters: FeedFilters = {}): Promise<Story[]> {
  if (!isSupabaseConfigured) return mockGetStories(filters);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories")
    .select(STORY_SELECT)
    .eq("status", "published");
  if (error || !data) return mockGetStories(filters);
  // Filtering/sorting happens in-app via the shared helper so behavior matches mock.
  return applyFeedFilters(data.map(mapStory), filters);
}

export async function getFeaturedStories(): Promise<Story[]> {
  if (!isSupabaseConfigured) return mockFeatured();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories")
    .select(STORY_SELECT)
    .eq("status", "published")
    .eq("featured", true)
    .limit(6);
  if (error || !data || data.length === 0) return mockFeatured();
  return data.map(mapStory);
}

export async function getStory(id: string): Promise<Story | undefined> {
  if (!isSupabaseConfigured) return mockGetStory(id);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories")
    .select(STORY_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return undefined;
  return mapStory(data);
}

export async function getRelatedStories(story: Story, limit = 3): Promise<Story[]> {
  if (!isSupabaseConfigured) return mockRelated(story, limit);
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select(STORY_SELECT)
    .eq("status", "published")
    .neq("id", story.id)
    .or(`category.eq.${story.category},mood.eq.${story.mood}`)
    .limit(limit);
  if (!data) return [];
  return data.map(mapStory);
}

export async function getReviews(storyId: string): Promise<StoryReview[]> {
  if (!isSupabaseConfigured) return mockReviews(storyId);
  const supabase = await createClient();
  const { data } = await supabase
    .from("story_reviews")
    .select(`*, reviewer:profiles!story_reviews_reviewer_id_fkey(anonymous_name,avatar_style)`)
    .eq("story_id", storyId)
    .order("created_at", { ascending: false });
  return (data as StoryReview[]) ?? [];
}

export async function getStoriesByAuthor(authorId: string): Promise<Story[]> {
  if (!isSupabaseConfigured) return mockByAuthor(authorId);
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select(STORY_SELECT)
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });
  if (!data) return [];
  return data.map(mapStory);
}

export async function getProfileByName(name: string): Promise<Profile | undefined> {
  if (!isSupabaseConfigured) return mockProfile(name);
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .ilike("anonymous_name", name)
    .maybeSingle();
  if (!profile) return undefined;
  // Aggregate stats from the anonymous-safe view.
  const { data: stats } = await supabase
    .from("profile_public")
    .select("*")
    .eq("id", profile.id)
    .maybeSingle();
  return {
    ...(profile as Profile),
    stats: stats
      ? {
          stories: Number(stats.stories) || 0,
          total_views: Number(stats.total_views) || 0,
          total_reads: Number(stats.total_reads) || 0,
          total_reviews: Number(stats.total_reviews) || 0,
          average_rating: Number(stats.average_rating) || 0,
          followers: Number(stats.followers) || 0,
          following: 0,
          streak_days: 0,
        }
      : undefined,
  };
}

export async function getTopWriters(limit = 10): Promise<Profile[]> {
  if (!isSupabaseConfigured) return mockTopWriters(limit);
  const supabase = await createClient();
  const { data } = await supabase
    .from("profile_public")
    .select("*")
    .order("total_reads", { ascending: false })
    .limit(limit);
  if (!data) return [];
  return data.map((p: any) => ({
    id: p.id,
    user_id: "",
    anonymous_name: p.anonymous_name,
    avatar_style: p.avatar_style,
    bio: p.bio,
    is_admin: false,
    created_at: p.created_at,
    stats: {
      stories: Number(p.stories) || 0,
      total_views: Number(p.total_views) || 0,
      total_reads: Number(p.total_reads) || 0,
      total_reviews: Number(p.total_reviews) || 0,
      average_rating: Number(p.average_rating) || 0,
      followers: Number(p.followers) || 0,
      following: 0,
      streak_days: 0,
    },
  }));
}

/**
 * The signed-in user's profile (or null if logged out). Falls back to the mock
 * "current user" when Supabase isn't configured so the demo still feels logged in.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return mockCurrentProfile();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) return null;
  const { data: stats } = await supabase
    .from("profile_public")
    .select("*")
    .eq("id", profile.id)
    .maybeSingle();
  return {
    ...(profile as Profile),
    stats: stats
      ? {
          stories: Number(stats.stories) || 0,
          total_views: Number(stats.total_views) || 0,
          total_reads: Number(stats.total_reads) || 0,
          total_reviews: Number(stats.total_reviews) || 0,
          average_rating: Number(stats.average_rating) || 0,
          followers: Number(stats.followers) || 0,
          following: 0,
          streak_days: 0,
        }
      : undefined,
  };
}
