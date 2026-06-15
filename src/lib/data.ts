/**
 * Data-access layer.
 *
 * The UI talks to these functions, never to mock arrays or Supabase directly.
 * Today they return seeded mock data; swapping to live Supabase is a matter of
 * replacing each body with a query (the return shapes already match the schema).
 */
import { MOCK_PROFILES, getProfileById, getProfileByName } from "./mock/profiles";
import {
  MOCK_STORIES,
  getReviewsForStory,
  getStoryById,
} from "./mock/stories";
import { MISSIONS } from "./missions";
import { BADGES } from "./badges";
import type { FeedSort, Profile, Story, StoryReview } from "./types";

/** Attach the (anonymous) author profile to a story. */
function withAuthor(story: Story): Story {
  return { ...story, author: getProfileById(story.author_id) };
}

/** Total reaction count across all types — used for trending math. */
function totalReactions(story: Story): number {
  if (!story.reactions) return 0;
  return Object.values(story.reactions).reduce((a, b) => a + b, 0);
}

/**
 * A lightweight "trending" heuristic: weight reads, reactions and review volume,
 * decayed by age. Mirrors what a SQL ranking would do server-side.
 */
function trendingScore(story: Story): number {
  const ageHours = Math.max(
    1,
    (Date.now() - new Date(story.created_at).getTime()) / 3_600_000,
  );
  const engagement =
    story.read_count * 1 +
    totalReactions(story) * 3 +
    (story.review_summary?.count ?? 0) * 8;
  return engagement / Math.pow(ageHours, 0.6);
}

export interface FeedFilters {
  sort?: FeedSort;
  category?: string;
  mood?: string;
  truthType?: string;
  locationVisibility?: string;
  search?: string;
  maxMinutes?: number;
  missionOnly?: boolean;
}

/** Query published stories with sorting + filtering. */
export function getStories(filters: FeedFilters = {}): Story[] {
  let list = MOCK_STORIES.filter((s) => s.status === "published").map(withAuthor);

  const {
    category,
    mood,
    truthType,
    locationVisibility,
    search,
    maxMinutes,
    missionOnly,
    sort = "trending",
  } = filters;

  if (category) list = list.filter((s) => s.category === category);
  if (mood) list = list.filter((s) => s.mood === mood);
  if (truthType) list = list.filter((s) => s.truth_type === truthType);
  if (locationVisibility)
    list = list.filter((s) => s.location_visibility === locationVisibility);
  if (missionOnly) list = list.filter((s) => Boolean(s.mission_id));
  if (typeof maxMinutes === "number")
    list = list.filter((s) => (s.reading_minutes ?? 0) <= maxMinutes);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.excerpt.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.category.toLowerCase().includes(q),
    );
  }

  switch (sort) {
    case "new":
      list.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      break;
    case "most_reviewed":
      list.sort(
        (a, b) => (b.review_summary?.count ?? 0) - (a.review_summary?.count ?? 0),
      );
      break;
    case "most_emotional":
      list.sort(
        (a, b) =>
          (b.reactions?.felt ?? 0) +
          (b.reactions?.painful ?? 0) -
          ((a.reactions?.felt ?? 0) + (a.reactions?.painful ?? 0)),
      );
      break;
    case "most_mysterious":
      list.sort(
        (a, b) =>
          (b.reactions?.say_more ?? 0) +
          (b.reactions?.unbelievable ?? 0) -
          ((a.reactions?.say_more ?? 0) + (a.reactions?.unbelievable ?? 0)),
      );
      break;
    case "most_controversial":
      list.sort((a, b) => totalReactions(b) - totalReactions(a));
      break;
    case "local":
      list = list
        .filter((s) => s.location_visibility !== "none")
        .sort((a, b) => b.read_count - a.read_count);
      break;
    case "trending":
    default:
      list.sort((a, b) => trendingScore(b) - trendingScore(a));
  }

  return list;
}

export function getFeaturedStories(): Story[] {
  return MOCK_STORIES.filter((s) => s.featured && s.status === "published")
    .map(withAuthor)
    .slice(0, 6);
}

export function getStory(id: string): Story | undefined {
  const story = getStoryById(id);
  return story ? withAuthor(story) : undefined;
}

export function getRelatedStories(story: Story, limit = 3): Story[] {
  return MOCK_STORIES.filter(
    (s) =>
      s.id !== story.id &&
      s.status === "published" &&
      (s.category === story.category || s.mood === story.mood),
  )
    .map(withAuthor)
    .slice(0, limit);
}

export function getRandomStory(): Story {
  const published = MOCK_STORIES.filter((s) => s.status === "published");
  return withAuthor(published[Math.floor(Math.random() * published.length)]);
}

export function getReviews(storyId: string): StoryReview[] {
  return getReviewsForStory(storyId);
}

export function getStoriesByAuthor(authorId: string): Story[] {
  return MOCK_STORIES.filter(
    (s) => s.author_id === authorId && s.status === "published",
  ).map(withAuthor);
}

export function getProfile(name: string): Profile | undefined {
  return getProfileByName(name);
}

/** Top writers leaderboard (by total reads). */
export function getTopWriters(limit = 10): Profile[] {
  return [...MOCK_PROFILES]
    .filter((p) => !p.is_admin)
    .sort((a, b) => (b.stats?.total_reads ?? 0) - (a.stats?.total_reads ?? 0))
    .slice(0, limit);
}

/** The signed-in user's profile (mock — first profile). */
export function getCurrentProfile(): Profile {
  return MOCK_PROFILES[0];
}

export { MISSIONS, BADGES };
