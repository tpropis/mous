-- =============================================================================
-- MOUS — Row Level Security policies
-- Run AFTER schema.sql.
--
-- Guarantees enforced here:
--   * Anyone can read PUBLISHED stories and the anonymous-safe public data.
--   * Users can only create/edit/delete THEIR OWN content.
--   * A user's drafts and private rows are visible only to them.
--   * Real emails (auth.users) are never exposed — no policy grants access to it.
--   * Admin-only actions (moderation) require is_admin().
-- =============================================================================

-- Enable RLS on every table -------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.stories         enable row level security;
alter table public.story_reactions enable row level security;
alter table public.story_reviews   enable row level security;
alter table public.bookmarks       enable row level security;
alter table public.follows         enable row level security;
alter table public.missions        enable row level security;
alter table public.user_missions   enable row level security;
alter table public.reports         enable row level security;
alter table public.badges          enable row level security;
alter table public.user_badges     enable row level security;

-- ----------------------------------------------------------------------------
-- profiles
--   Public profiles are readable (they contain NO email / real name).
--   A user may insert/update only their own profile row.
-- ----------------------------------------------------------------------------
create policy "profiles are publicly readable"
  on public.profiles for select using (true);

create policy "users insert their own profile"
  on public.profiles for insert
  with check (user_id = auth.uid());

create policy "users update their own profile"
  on public.profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "admins update any profile"
  on public.profiles for update using (public.is_admin());

-- ----------------------------------------------------------------------------
-- stories
--   Read: published stories OR your own (any status). Admins read all.
--   Write: only the author (mapped via current_profile_id()).
-- ----------------------------------------------------------------------------
create policy "published stories are readable"
  on public.stories for select
  using (
    status = 'published'
    or author_id = public.current_profile_id()
    or public.is_admin()
  );

create policy "authors insert their own stories"
  on public.stories for insert
  with check (author_id = public.current_profile_id());

create policy "authors update their own stories"
  on public.stories for update
  using (author_id = public.current_profile_id())
  with check (author_id = public.current_profile_id());

create policy "authors delete their own stories"
  on public.stories for delete
  using (author_id = public.current_profile_id());

create policy "admins moderate stories"
  on public.stories for update using (public.is_admin());
create policy "admins delete stories"
  on public.stories for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- story_reactions — readable by all; users manage only their own.
-- ----------------------------------------------------------------------------
create policy "reactions are readable"
  on public.story_reactions for select using (true);
create policy "users add their own reactions"
  on public.story_reactions for insert
  with check (user_id = public.current_profile_id());
create policy "users remove their own reactions"
  on public.story_reactions for delete
  using (user_id = public.current_profile_id());

-- ----------------------------------------------------------------------------
-- story_reviews — readable by all; users manage only their own.
-- ----------------------------------------------------------------------------
create policy "reviews are readable"
  on public.story_reviews for select using (true);
create policy "users write their own reviews"
  on public.story_reviews for insert
  with check (reviewer_id = public.current_profile_id());
create policy "users update their own reviews"
  on public.story_reviews for update
  using (reviewer_id = public.current_profile_id())
  with check (reviewer_id = public.current_profile_id());
create policy "users delete their own reviews"
  on public.story_reviews for delete
  using (reviewer_id = public.current_profile_id());
create policy "admins delete reviews"
  on public.story_reviews for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- bookmarks — PRIVATE: only the owner can see or manage them.
-- ----------------------------------------------------------------------------
create policy "users read their own bookmarks"
  on public.bookmarks for select
  using (user_id = public.current_profile_id());
create policy "users add their own bookmarks"
  on public.bookmarks for insert
  with check (user_id = public.current_profile_id());
create policy "users remove their own bookmarks"
  on public.bookmarks for delete
  using (user_id = public.current_profile_id());

-- ----------------------------------------------------------------------------
-- follows — readable (anonymous), users manage only their own follow rows.
-- ----------------------------------------------------------------------------
create policy "follows are readable"
  on public.follows for select using (true);
create policy "users create their own follows"
  on public.follows for insert
  with check (follower_id = public.current_profile_id());
create policy "users delete their own follows"
  on public.follows for delete
  using (follower_id = public.current_profile_id());

-- ----------------------------------------------------------------------------
-- missions — public catalog (read-only to users); admins manage.
-- ----------------------------------------------------------------------------
create policy "missions are readable"
  on public.missions for select using (true);
create policy "admins manage missions"
  on public.missions for all
  using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- user_missions — PRIVATE to the user.
-- ----------------------------------------------------------------------------
create policy "users read their own mission progress"
  on public.user_missions for select
  using (user_id = public.current_profile_id());
create policy "users accept missions"
  on public.user_missions for insert
  with check (user_id = public.current_profile_id());
create policy "users update their own mission progress"
  on public.user_missions for update
  using (user_id = public.current_profile_id())
  with check (user_id = public.current_profile_id());

-- ----------------------------------------------------------------------------
-- reports — a user can file a report and see their own; admins see/manage all.
-- ----------------------------------------------------------------------------
create policy "users file reports"
  on public.reports for insert
  with check (reporter_id = public.current_profile_id());
create policy "users read their own reports"
  on public.reports for select
  using (reporter_id = public.current_profile_id() or public.is_admin());
create policy "admins manage reports"
  on public.reports for update using (public.is_admin());

-- ----------------------------------------------------------------------------
-- badges — public catalog. user_badges readable (anonymous), system-awarded.
-- ----------------------------------------------------------------------------
create policy "badges are readable"
  on public.badges for select using (true);
create policy "admins manage badges"
  on public.badges for all
  using (public.is_admin()) with check (public.is_admin());

create policy "user badges are readable"
  on public.user_badges for select using (true);
create policy "admins grant badges"
  on public.user_badges for insert with check (public.is_admin());

-- =============================================================================
-- NOTE on emails: auth.users is owned by the `supabase_auth_admin` role and is
-- NOT in the `public` schema. No policy above references it, so emails are never
-- reachable from the anon/authenticated API. The app reads identity exclusively
-- from `profiles` / `profile_public`, which contain only anonymous fields.
-- =============================================================================
