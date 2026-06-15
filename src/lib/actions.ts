"use server";

/**
 * Server actions — every write the app performs.
 *
 * These run on the server with the user's auth cookie, so Supabase RLS enforces
 * that a user can only mutate their own content. When Supabase isn't configured
 * they return a benign mock result so the UI flow still completes in demo mode.
 */
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createTypedClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { truncate } from "@/lib/utils";
import type { ReactionType } from "@/lib/types";

/**
 * Loosely-typed client for writes. supabase-js v2.108 resolves typed
 * insert/update payloads to `never`; our PublishInput/ReviewInput types already
 * enforce the shapes, so we use an untyped client here for the mutation layer.
 */
async function createClient(): Promise<SupabaseClient> {
  return (await createTypedClient()) as unknown as SupabaseClient;
}

export interface ActionResult<T = undefined> {
  ok: boolean;
  error?: string;
  data?: T;
}

/** Resolve the signed-in user's profile id (RLS anchor). */
async function profileId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  return data?.id ?? null;
}

export interface PublishInput {
  title: string;
  body: string;
  category: string;
  mood: string;
  tags: string[];
  truth_type: string;
  location_visibility: string;
  city?: string | null;
  state?: string | null;
  content_warning: boolean;
  content_warning_label?: string | null;
  mission_id?: string | null;
  status: "draft" | "published";
}

/** Create (or save as draft) a story authored by the current user. */
export async function publishStory(
  input: PublishInput,
): Promise<ActionResult<{ id: string }>> {
  if (!isSupabaseConfigured) {
    // Demo mode: pretend it worked so the celebration flow runs.
    return { ok: true, data: { id: "demo" } };
  }
  const author_id = await profileId();
  if (!author_id) return { ok: false, error: "You must be signed in." };

  const supabase = await createClient();
  const excerpt = truncate(input.body.replace(/\s+/g, " ").trim(), 180);
  const { data, error } = await supabase
    .from("stories")
    .insert({
      author_id,
      title: input.title,
      body: input.body,
      excerpt,
      category: input.category,
      mood: input.mood,
      tags: input.tags,
      truth_type: input.truth_type,
      location_visibility: input.location_visibility,
      city: input.city ?? null,
      state: input.state ?? null,
      content_warning: input.content_warning,
      content_warning_label: input.content_warning_label ?? null,
      mission_id: input.mission_id ?? null,
      status: input.status,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "Failed to save." };

  revalidatePath("/feed");
  revalidatePath("/dashboard");
  return { ok: true, data: { id: data.id } };
}

/** Toggle a reaction on a story for the current user. */
export async function toggleReaction(
  storyId: string,
  reaction: ReactionType,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: true };
  const user_id = await profileId();
  if (!user_id) return { ok: false, error: "Sign in to react." };
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("story_reactions")
    .select("id")
    .eq("story_id", storyId)
    .eq("user_id", user_id)
    .eq("reaction_type", reaction)
    .maybeSingle();

  if (existing) {
    await supabase.from("story_reactions").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("story_reactions")
      .insert({ story_id: storyId, user_id, reaction_type: reaction });
  }
  revalidatePath(`/story/${storyId}`);
  return { ok: true };
}

export interface ReviewInput {
  rating: number;
  writing_score: number;
  honesty_score: number;
  emotion_score: number;
  impact_score: number;
  entertainment_score: number;
  review_text?: string | null;
}

/** Submit (or update) the current user's review of a story. */
export async function submitReview(
  storyId: string,
  input: ReviewInput,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: true };
  const reviewer_id = await profileId();
  if (!reviewer_id) return { ok: false, error: "Sign in to review." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("story_reviews")
    .upsert(
      { story_id: storyId, reviewer_id, ...input },
      { onConflict: "story_id,reviewer_id" },
    );
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/story/${storyId}`);
  return { ok: true };
}

/** Toggle a bookmark for the current user. */
export async function toggleBookmark(storyId: string): Promise<ActionResult<{ saved: boolean }>> {
  if (!isSupabaseConfigured) return { ok: true, data: { saved: true } };
  const user_id = await profileId();
  if (!user_id) return { ok: false, error: "Sign in to save." };
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("story_id", storyId)
    .eq("user_id", user_id)
    .maybeSingle();
  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id);
    return { ok: true, data: { saved: false } };
  }
  await supabase.from("bookmarks").insert({ story_id: storyId, user_id });
  return { ok: true, data: { saved: true } };
}

/** Toggle following another (anonymous) profile. */
export async function toggleFollow(profileId_: string): Promise<ActionResult<{ following: boolean }>> {
  if (!isSupabaseConfigured) return { ok: true, data: { following: true } };
  const follower_id = await profileId();
  if (!follower_id) return { ok: false, error: "Sign in to follow." };
  if (follower_id === profileId_) return { ok: false, error: "You can't follow yourself." };
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", follower_id)
    .eq("followed_profile_id", profileId_)
    .maybeSingle();
  if (existing) {
    await supabase.from("follows").delete().eq("id", existing.id);
    return { ok: true, data: { following: false } };
  }
  await supabase
    .from("follows")
    .insert({ follower_id, followed_profile_id: profileId_ });
  return { ok: true, data: { following: true } };
}

/** File a moderation report. */
export async function fileReport(
  contentType: "story" | "review" | "profile",
  contentId: string,
  reason: string,
  details?: string,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: true };
  const reporter_id = await profileId();
  if (!reporter_id) return { ok: false, error: "Sign in to report." };
  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_id,
    content_type: contentType,
    content_id: contentId,
    reason,
    details: details ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Accept a Story Mission. */
export async function acceptMission(missionId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: true };
  const user_id = await profileId();
  if (!user_id) return { ok: false, error: "Sign in to accept missions." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_missions")
    .upsert(
      { user_id, mission_id: missionId, status: "accepted" },
      { onConflict: "user_id,mission_id" },
    );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/missions");
  return { ok: true };
}

/** Mark a Story Mission complete (optionally tied to the story it produced). */
export async function completeMission(
  missionId: string,
  completedStoryId?: string,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: true };
  const user_id = await profileId();
  if (!user_id) return { ok: false, error: "Sign in first." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_missions")
    .update({ status: "completed", completed_story_id: completedStoryId ?? null })
    .eq("user_id", user_id)
    .eq("mission_id", missionId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/missions");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Admin actions — guarded by is_admin() in RLS; the UI also checks is_admin.
// ---------------------------------------------------------------------------

export async function setStoryStatus(
  storyId: string,
  status: "published" | "removed",
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: true };
  const supabase = await createClient();
  const { error } = await supabase.from("stories").update({ status }).eq("id", storyId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function setStoryFeatured(
  storyId: string,
  featured: boolean,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: true };
  const supabase = await createClient();
  const { error } = await supabase
    .from("stories")
    .update({ featured })
    .eq("id", storyId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function resolveReport(
  reportId: string,
  status: "resolved" | "dismissed",
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: true };
  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({ status })
    .eq("id", reportId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

/** Sign the current user out. */
export async function signOut(): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: true };
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  return { ok: true };
}
