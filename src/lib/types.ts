/**
 * MOUS domain types.
 * These mirror the Supabase schema in `supabase/schema.sql` so the UI can move
 * from mock data to live data with no shape changes.
 */

export type StoryStatus = "draft" | "published" | "removed";

export type TruthType =
  | "true_story"
  | "inspired"
  | "fictionalized"
  | "confession";

export type LocationVisibility = "none" | "city" | "state" | "region";

export type ReactionType =
  | "felt"
  | "wild"
  | "beautiful"
  | "painful"
  | "funny"
  | "unbelievable"
  | "say_more"
  | "changed_me";

export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

export type ReportContentType = "story" | "review" | "profile";

export type MissionStatus = "accepted" | "completed" | "abandoned";

export type MissionDifficulty = "easy" | "medium" | "bold";

export type BadgeRequirement =
  | "first_story"
  | "reads"
  | "reactions"
  | "reviews"
  | "streak"
  | "mission"
  | "rating"
  | "local";

/** Public, anonymous-safe profile. Never carries email / real name. */
export interface Profile {
  id: string;
  user_id: string;
  anonymous_name: string;
  avatar_style: string; // seed string for the abstract avatar generator
  bio: string | null;
  is_admin: boolean;
  created_at: string;
  // Derived / aggregated, populated by views:
  stats?: ProfileStats;
}

export interface ProfileStats {
  stories: number;
  total_views: number;
  total_reads: number;
  total_reviews: number;
  average_rating: number;
  followers: number;
  following: number;
  streak_days: number;
}

export interface Story {
  id: string;
  author_id: string;
  title: string;
  body: string;
  excerpt: string;
  category: string;
  mood: string;
  tags: string[];
  truth_type: TruthType;
  location_visibility: LocationVisibility;
  city: string | null;
  state: string | null;
  content_warning: boolean;
  content_warning_label?: string | null;
  status: StoryStatus;
  featured?: boolean;
  view_count: number;
  read_count: number;
  created_at: string;
  updated_at: string;
  mission_id?: string | null;
  // Joined / derived:
  author?: Profile;
  reactions?: ReactionSummary;
  review_summary?: ReviewSummary;
  reading_minutes?: number;
}

export type ReactionSummary = Record<ReactionType, number>;

export interface StoryReaction {
  id: string;
  story_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface StoryReview {
  id: string;
  story_id: string;
  reviewer_id: string;
  rating: number; // 1..5 overall / emotional rating
  writing_score: number;
  honesty_score: number;
  emotion_score: number;
  impact_score: number;
  entertainment_score: number;
  review_text: string | null;
  created_at: string;
  reviewer?: Pick<Profile, "anonymous_name" | "avatar_style">;
}

export interface ReviewSummary {
  count: number;
  average: number;
  writing: number;
  honesty: number;
  emotion: number;
  impact: number;
  entertainment: number;
}

export interface Bookmark {
  id: string;
  user_id: string;
  story_id: string;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  followed_profile_id: string;
  created_at: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: MissionDifficulty;
  prompt: string;
  reward_badge?: string | null;
  accepted_count: number;
  completed_count: number;
  created_at: string;
}

export interface UserMission {
  id: string;
  user_id: string;
  mission_id: string;
  status: MissionStatus;
  completed_story_id: string | null;
  created_at: string;
  mission?: Mission;
}

export interface Report {
  id: string;
  reporter_id: string;
  content_type: ReportContentType;
  content_id: string;
  reason: string;
  details?: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  requirement_type: BadgeRequirement;
  threshold?: number;
  accent: string; // tailwind color token e.g. "neon.violet"
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

/** Feed sort modes surfaced in the UI. */
export type FeedSort =
  | "trending"
  | "new"
  | "most_reviewed"
  | "most_emotional"
  | "most_mysterious"
  | "most_controversial"
  | "local";
