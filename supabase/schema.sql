-- =============================================================================
-- MOUS — Database schema
-- Anonymous storytelling platform. Run this in the Supabase SQL editor (or via
-- the Supabase CLI) on a fresh project, then run `policies.sql` and `seed.sql`.
--
-- Design principle: nothing in the PUBLIC schema ever stores a real name. The
-- only place an email lives is `auth.users` (managed by Supabase) and it is
-- never exposed through any public table, view, or policy.
-- =============================================================================

-- Extensions ------------------------------------------------------------------
create extension if not exists "pgcrypto";      -- gen_random_uuid()

-- Enums -----------------------------------------------------------------------
do $$ begin
  create type story_status        as enum ('draft', 'published', 'removed');
  create type truth_type          as enum ('true_story', 'inspired', 'fictionalized', 'confession');
  create type location_visibility as enum ('none', 'city', 'state', 'region');
  create type reaction_type       as enum ('felt','wild','beautiful','painful','funny','unbelievable','say_more','changed_me');
  create type report_status       as enum ('open','reviewing','resolved','dismissed');
  create type report_content_type as enum ('story','review','profile');
  create type mission_status      as enum ('accepted','completed','abandoned');
  create type mission_difficulty  as enum ('easy','medium','bold');
exception
  when duplicate_object then null;
end $$;

-- =============================================================================
-- profiles — public, anonymous-safe identity (1:1 with auth.users)
-- =============================================================================
create table if not exists public.profiles (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null unique references auth.users(id) on delete cascade,
  anonymous_name text not null unique,
  avatar_style   text not null default 'seed',
  bio            text,
  is_admin       boolean not null default false,
  created_at     timestamptz not null default now()
);
comment on table public.profiles is 'Public anonymous identity. Never stores real name or email.';

-- =============================================================================
-- stories
-- =============================================================================
create table if not exists public.stories (
  id                     uuid primary key default gen_random_uuid(),
  author_id              uuid not null references public.profiles(id) on delete cascade,
  title                  text not null check (char_length(title) between 1 and 160),
  body                   text not null,
  excerpt                text not null default '',
  category               text not null,
  mood                   text not null,
  tags                   text[] not null default '{}',
  truth_type             truth_type not null default 'true_story',
  location_visibility    location_visibility not null default 'none',
  city                   text,
  state                  text,
  content_warning        boolean not null default false,
  content_warning_label  text,
  status                 story_status not null default 'draft',
  featured               boolean not null default false,
  view_count             integer not null default 0,
  read_count             integer not null default 0,
  mission_id             uuid references public.missions(id) on delete set null,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists stories_status_created_idx on public.stories (status, created_at desc);
create index if not exists stories_author_idx          on public.stories (author_id);
create index if not exists stories_category_idx        on public.stories (category);
create index if not exists stories_mood_idx            on public.stories (mood);

-- =============================================================================
-- story_reactions — one row per (story, user, reaction_type)
-- =============================================================================
create table if not exists public.story_reactions (
  id            uuid primary key default gen_random_uuid(),
  story_id      uuid not null references public.stories(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  reaction_type reaction_type not null,
  created_at    timestamptz not null default now(),
  unique (story_id, user_id, reaction_type)
);
create index if not exists reactions_story_idx on public.story_reactions (story_id);

-- =============================================================================
-- story_reviews — one review per (story, reviewer)
-- =============================================================================
create table if not exists public.story_reviews (
  id                  uuid primary key default gen_random_uuid(),
  story_id            uuid not null references public.stories(id) on delete cascade,
  reviewer_id         uuid not null references public.profiles(id) on delete cascade,
  rating              smallint not null check (rating between 1 and 5),
  writing_score       smallint not null default 0 check (writing_score between 0 and 5),
  honesty_score       smallint not null default 0 check (honesty_score between 0 and 5),
  emotion_score       smallint not null default 0 check (emotion_score between 0 and 5),
  impact_score        smallint not null default 0 check (impact_score between 0 and 5),
  entertainment_score smallint not null default 0 check (entertainment_score between 0 and 5),
  review_text         text,
  created_at          timestamptz not null default now(),
  unique (story_id, reviewer_id)            -- anti-spam: one review per story per user
);
create index if not exists reviews_story_idx on public.story_reviews (story_id);

-- =============================================================================
-- bookmarks
-- =============================================================================
create table if not exists public.bookmarks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  story_id   uuid not null references public.stories(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, story_id)
);

-- =============================================================================
-- follows — anonymous following (profile follows profile)
-- =============================================================================
create table if not exists public.follows (
  id                  uuid primary key default gen_random_uuid(),
  follower_id         uuid not null references public.profiles(id) on delete cascade,
  followed_profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at          timestamptz not null default now(),
  unique (follower_id, followed_profile_id),
  check (follower_id <> followed_profile_id)
);

-- =============================================================================
-- missions — Story Missions ("Get Out There")
-- =============================================================================
create table if not exists public.missions (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text not null,
  category     text not null,
  difficulty   mission_difficulty not null default 'easy',
  prompt       text not null default '',
  reward_badge text,
  created_at   timestamptz not null default now()
);

-- =============================================================================
-- user_missions
-- =============================================================================
create table if not exists public.user_missions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  mission_id          uuid not null references public.missions(id) on delete cascade,
  status              mission_status not null default 'accepted',
  completed_story_id  uuid references public.stories(id) on delete set null,
  created_at          timestamptz not null default now(),
  unique (user_id, mission_id)
);

-- =============================================================================
-- reports — moderation queue
-- =============================================================================
create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.profiles(id) on delete cascade,
  content_type report_content_type not null,
  content_id   uuid not null,
  reason       text not null,
  details      text,
  status       report_status not null default 'open',
  created_at   timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports (status);

-- =============================================================================
-- badges + user_badges
-- =============================================================================
create table if not exists public.badges (
  id               text primary key,
  name             text not null,
  description      text not null,
  icon             text not null,
  requirement_type text not null,
  threshold        integer,
  accent           text not null default 'neon.violet'
);

create table if not exists public.user_badges (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles(id) on delete cascade,
  badge_id  text not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

-- =============================================================================
-- Helper functions / triggers
-- =============================================================================

-- keep stories.updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists stories_touch_updated_at on public.stories;
create trigger stories_touch_updated_at
  before update on public.stories
  for each row execute function public.touch_updated_at();

-- is the calling auth user an admin? (used by RLS in policies.sql)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and is_admin = true
  );
$$;

-- map the calling auth user to their profile id
create or replace function public.current_profile_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.profiles where user_id = auth.uid();
$$;

-- auto-create a profile with a placeholder anonymous name when a user signs up.
-- The app immediately lets the user pick/confirm their pen name afterward.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, anonymous_name, avatar_style)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'anonymous_name', 'Mous ' || floor(random()*9000+1000)::text),
    coalesce(new.raw_user_meta_data->>'avatar_style', substr(md5(random()::text), 1, 8))
  )
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- Aggregated, anonymous-safe public view for profile stats.
-- Exposes ONLY anonymous fields + counts. No user_id, no email, no real name.
-- =============================================================================
create or replace view public.profile_public as
select
  p.id,
  p.anonymous_name,
  p.avatar_style,
  p.bio,
  p.created_at,
  count(distinct s.id) filter (where s.status = 'published')        as stories,
  coalesce(sum(s.view_count) filter (where s.status='published'),0) as total_views,
  coalesce(sum(s.read_count) filter (where s.status='published'),0) as total_reads,
  count(distinct r.id)                                              as total_reviews,
  coalesce(round(avg(r.rating)::numeric, 2), 0)                     as average_rating,
  (select count(*) from public.follows f where f.followed_profile_id = p.id) as followers
from public.profiles p
left join public.stories s       on s.author_id = p.id
left join public.story_reviews r on r.story_id = s.id
group by p.id;
comment on view public.profile_public is 'Anonymous-safe aggregated profile. Never exposes user_id or email.';
