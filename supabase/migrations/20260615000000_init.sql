-- =============================================================================
-- MOUS — initial migration (schema + RLS + catalog seed)
-- Applied automatically by the Supabase GitHub integration on merge to the
-- production branch, or run manually in the SQL editor.
--
-- Privacy principle: nothing in the public schema stores a real name. Emails
-- live only in auth.users and are never referenced by any policy below.
-- =============================================================================

create extension if not exists "pgcrypto";

-- Enums -----------------------------------------------------------------------
do $$ begin
  create type story_status        as enum ('draft','published','removed');
  create type truth_type          as enum ('true_story','inspired','fictionalized','confession');
  create type location_visibility as enum ('none','city','state','region');
  create type reaction_type       as enum ('felt','wild','beautiful','painful','funny','unbelievable','say_more','changed_me');
  create type report_status       as enum ('open','reviewing','resolved','dismissed');
  create type report_content_type as enum ('story','review','profile');
  create type mission_status      as enum ('accepted','completed','abandoned');
  create type mission_difficulty  as enum ('easy','medium','bold');
exception when duplicate_object then null; end $$;

-- profiles --------------------------------------------------------------------
create table if not exists public.profiles (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null unique references auth.users(id) on delete cascade,
  anonymous_name text not null unique,
  avatar_style   text not null default 'seed',
  bio            text,
  is_admin       boolean not null default false,
  created_at     timestamptz not null default now()
);

-- missions (created BEFORE stories because stories references it) --------------
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

-- stories ---------------------------------------------------------------------
create table if not exists public.stories (
  id                    uuid primary key default gen_random_uuid(),
  author_id             uuid not null references public.profiles(id) on delete cascade,
  title                 text not null check (char_length(title) between 1 and 160),
  body                  text not null,
  excerpt               text not null default '',
  category              text not null,
  mood                  text not null,
  tags                  text[] not null default '{}',
  truth_type            truth_type not null default 'true_story',
  location_visibility   location_visibility not null default 'none',
  city                  text,
  state                 text,
  content_warning       boolean not null default false,
  content_warning_label text,
  status                story_status not null default 'draft',
  featured              boolean not null default false,
  view_count            integer not null default 0,
  read_count            integer not null default 0,
  mission_id            uuid references public.missions(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists stories_status_created_idx on public.stories (status, created_at desc);
create index if not exists stories_author_idx on public.stories (author_id);

-- reactions / reviews / bookmarks / follows -----------------------------------
create table if not exists public.story_reactions (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction_type reaction_type not null,
  created_at timestamptz not null default now(),
  unique (story_id, user_id, reaction_type)
);
create index if not exists reactions_story_idx on public.story_reactions (story_id);

create table if not exists public.story_reviews (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  writing_score smallint not null default 0 check (writing_score between 0 and 5),
  honesty_score smallint not null default 0 check (honesty_score between 0 and 5),
  emotion_score smallint not null default 0 check (emotion_score between 0 and 5),
  impact_score smallint not null default 0 check (impact_score between 0 and 5),
  entertainment_score smallint not null default 0 check (entertainment_score between 0 and 5),
  review_text text,
  created_at timestamptz not null default now(),
  unique (story_id, reviewer_id)
);
create index if not exists reviews_story_idx on public.story_reviews (story_id);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, story_id)
);

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followed_profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, followed_profile_id),
  check (follower_id <> followed_profile_id)
);

create table if not exists public.user_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  status mission_status not null default 'accepted',
  completed_story_id uuid references public.stories(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, mission_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  content_type report_content_type not null,
  content_id uuid not null,
  reason text not null,
  details text,
  status report_status not null default 'open',
  created_at timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports (status);

create table if not exists public.badges (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  requirement_type text not null,
  threshold integer,
  accent text not null default 'neon.violet'
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id text not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

-- functions / triggers --------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists stories_touch_updated_at on public.stories;
create trigger stories_touch_updated_at before update on public.stories
  for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true);
$$;

create or replace function public.current_profile_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.profiles where user_id = auth.uid();
$$;

-- auto-create an anonymous profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, anonymous_name, avatar_style)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'anonymous_name', 'Mous ' || floor(random()*9000+1000)::text),
    coalesce(new.raw_user_meta_data->>'avatar_style', substr(md5(random()::text),1,8))
  ) on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- anonymous-safe aggregated public profile view -------------------------------
create or replace view public.profile_public as
select
  p.id, p.anonymous_name, p.avatar_style, p.bio, p.created_at,
  count(distinct s.id) filter (where s.status='published') as stories,
  coalesce(sum(s.view_count) filter (where s.status='published'),0) as total_views,
  coalesce(sum(s.read_count) filter (where s.status='published'),0) as total_reads,
  count(distinct r.id) as total_reviews,
  coalesce(round(avg(r.rating)::numeric,2),0) as average_rating,
  (select count(*) from public.follows f where f.followed_profile_id = p.id) as followers
from public.profiles p
left join public.stories s on s.author_id = p.id
left join public.story_reviews r on r.story_id = s.id
group by p.id;

-- =============================================================================
-- Row level security
-- =============================================================================
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

create policy "profiles readable" on public.profiles for select using (true);
create policy "insert own profile" on public.profiles for insert with check (user_id = auth.uid());
create policy "update own profile" on public.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "read published or own stories" on public.stories for select
  using (status='published' or author_id = public.current_profile_id() or public.is_admin());
create policy "insert own stories" on public.stories for insert with check (author_id = public.current_profile_id());
create policy "update own stories" on public.stories for update
  using (author_id = public.current_profile_id() or public.is_admin())
  with check (author_id = public.current_profile_id() or public.is_admin());
create policy "delete own stories" on public.stories for delete
  using (author_id = public.current_profile_id() or public.is_admin());

create policy "reactions readable" on public.story_reactions for select using (true);
create policy "manage own reactions ins" on public.story_reactions for insert with check (user_id = public.current_profile_id());
create policy "manage own reactions del" on public.story_reactions for delete using (user_id = public.current_profile_id());

create policy "reviews readable" on public.story_reviews for select using (true);
create policy "write own reviews" on public.story_reviews for insert with check (reviewer_id = public.current_profile_id());
create policy "update own reviews" on public.story_reviews for update using (reviewer_id = public.current_profile_id());
create policy "delete own reviews" on public.story_reviews for delete using (reviewer_id = public.current_profile_id() or public.is_admin());

create policy "read own bookmarks" on public.bookmarks for select using (user_id = public.current_profile_id());
create policy "add own bookmarks" on public.bookmarks for insert with check (user_id = public.current_profile_id());
create policy "remove own bookmarks" on public.bookmarks for delete using (user_id = public.current_profile_id());

create policy "follows readable" on public.follows for select using (true);
create policy "create own follows" on public.follows for insert with check (follower_id = public.current_profile_id());
create policy "delete own follows" on public.follows for delete using (follower_id = public.current_profile_id());

create policy "missions readable" on public.missions for select using (true);
create policy "admins manage missions" on public.missions for all using (public.is_admin()) with check (public.is_admin());

create policy "read own mission progress" on public.user_missions for select using (user_id = public.current_profile_id());
create policy "accept missions" on public.user_missions for insert with check (user_id = public.current_profile_id());
create policy "update own mission progress" on public.user_missions for update using (user_id = public.current_profile_id()) with check (user_id = public.current_profile_id());

create policy "file reports" on public.reports for insert with check (reporter_id = public.current_profile_id());
create policy "read own reports" on public.reports for select using (reporter_id = public.current_profile_id() or public.is_admin());
create policy "admins manage reports" on public.reports for update using (public.is_admin());

create policy "badges readable" on public.badges for select using (true);
create policy "admins manage badges" on public.badges for all using (public.is_admin()) with check (public.is_admin());
create policy "user badges readable" on public.user_badges for select using (true);
create policy "admins grant badges" on public.user_badges for insert with check (public.is_admin());

-- =============================================================================
-- Catalog seed (badges + missions) — the app depends on these existing.
-- =============================================================================
insert into public.badges (id,name,description,icon,requirement_type,threshold,accent) values
  ('first-story','First Story','You published your first story. The hardest one is behind you.','Sparkles','first_story',null,'neon.violet'),
  ('reads-1k','1,000 Reads','A thousand people read what you wrote.','BookOpen','reads',1000,'neon.blue'),
  ('reads-10k','10,000 Reads','Ten thousand reads. Your words travel further than your name.','Flame','reads',10000,'neon.amber'),
  ('most-felt','Most Felt','Your story collected more ''I felt this'' than any other this week.','Heart','reactions',500,'neon.rose'),
  ('midnight-writer','Midnight Writer','You published between midnight and 4am.','Moon','streak',null,'neon.violet'),
  ('truth-teller','Truth Teller','Ten true stories, no embellishment.','ShieldCheck','rating',10,'neon.teal'),
  ('ghost-author','Ghost Author','A full month of writing without a single identifying detail.','Ghost','streak',30,'neon.blue'),
  ('local-legend','Local Legend','The most-read author in your region.','MapPin','local',null,'neon.amber'),
  ('viral-story','Viral Story','One story crossed 50,000 views in a week.','TrendingUp','reads',50000,'neon.rose'),
  ('deep-cut','Deep Cut','A 4.8+ rated story with fewer than 1,000 reads. A hidden gem.','Gem','rating',null,'neon.teal'),
  ('crowd-favorite','Crowd Favorite','100+ reviews averaging 4.5 stars.','Star','reviews',100,'neon.amber'),
  ('mission-runner','Mission Runner','You completed 5 Story Missions. You actually went out there.','Compass','mission',5,'neon.violet')
on conflict (id) do nothing;

insert into public.missions (title,description,category,difficulty,prompt,reward_badge) values
  ('Talk to a stranger','Strike up a real conversation with someone you''ve never met. No phone in hand.','Confession','easy','What surprised you about them?','mission-runner'),
  ('Go somewhere alone','A bar, a diner, a movie — go by yourself and sit with it.','Travel','easy','What did the silence tell you?',null),
  ('Say yes to something random','The next invitation you''d normally decline — accept it.','Wild Night','medium','Where did ''yes'' take you?',null),
  ('Ask someone their craziest story','Then tell it here (with their blessing, names removed).','Funny','easy','What''s the wildest thing you heard?',null),
  ('Visit a bar you''ve never been to','Somewhere outside your usual orbit. Watch. Listen. Report back.','Nightlife','medium','Who did you meet at the end of the bar?','local-legend'),
  ('Call someone you miss','Not text. Call. The person you keep meaning to.','Relationships','bold','What did you finally say?',null),
  ('Do something that scares you a little','Small fear, real edge. Then write the moment before you did it.','Comeback Story','bold','What were you afraid of, really?',null),
  ('Go to a local event and write what happened','Open mic, market, protest, show. Be a witness for the night.','Local','medium','What did the crowd reveal?','local-legend'),
  ('Write about the moment you almost left','A job, a city, a person, a life. The fork you stared down.','Regret','bold','Why did you stay — or go?',null)
on conflict do nothing;
