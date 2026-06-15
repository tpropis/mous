-- =============================================================================
-- MOUS — Seed data
-- Run AFTER schema.sql and policies.sql.
--
-- Seeds the static catalogs (badges, missions) that the app relies on, plus a
-- set of demo profiles + stories so a fresh project isn't empty.
--
-- NOTE: profiles normally reference auth.users(id). For a pure-SQL demo seed we
-- create matching auth.users rows with placeholder emails. These emails exist
-- ONLY in auth.users and are never exposed publicly (see policies.sql). In a
-- real deployment, profiles are created automatically by the handle_new_user()
-- trigger when people sign up — you would seed only badges + missions below.
-- =============================================================================

-- ---------------------------------------------------------------- badges -----
insert into public.badges (id, name, description, icon, requirement_type, threshold, accent) values
  ('first-story',    'First Story',     'You published your first story. The hardest one is behind you.', 'Sparkles',    'first_story', null,  'neon.violet'),
  ('reads-1k',       '1,000 Reads',     'A thousand people read what you wrote.',                          'BookOpen',    'reads',       1000,  'neon.blue'),
  ('reads-10k',      '10,000 Reads',    'Ten thousand reads. Your words travel further than your name.',   'Flame',       'reads',       10000, 'neon.amber'),
  ('most-felt',      'Most Felt',       'Your story collected more ''I felt this'' than any other this week.','Heart',      'reactions',   500,   'neon.rose'),
  ('midnight-writer','Midnight Writer', 'You published between midnight and 4am.',                          'Moon',        'streak',      null,  'neon.violet'),
  ('truth-teller',   'Truth Teller',    'Ten true stories, no embellishment.',                             'ShieldCheck', 'rating',      10,    'neon.teal'),
  ('ghost-author',   'Ghost Author',    'A full month of writing without a single identifying detail.',     'Ghost',       'streak',      30,    'neon.blue'),
  ('local-legend',   'Local Legend',    'The most-read author in your region.',                            'MapPin',      'local',       null,  'neon.amber'),
  ('viral-story',    'Viral Story',     'One story crossed 50,000 views in a week.',                       'TrendingUp',  'reads',       50000, 'neon.rose'),
  ('deep-cut',       'Deep Cut',        'A 4.8+ rated story with fewer than 1,000 reads. A hidden gem.',    'Gem',         'rating',      null,  'neon.teal'),
  ('crowd-favorite', 'Crowd Favorite',  '100+ reviews averaging 4.5 stars.',                               'Star',        'reviews',     100,   'neon.amber'),
  ('mission-runner', 'Mission Runner',  'You completed 5 Story Missions. You actually went out there.',     'Compass',     'mission',     5,     'neon.violet')
on conflict (id) do nothing;

-- --------------------------------------------------------------- missions ----
insert into public.missions (title, description, category, difficulty, prompt, reward_badge) values
  ('Talk to a stranger',                 'Strike up a real conversation with someone you''ve never met. No phone in hand.', 'Confession',     'easy',   'What surprised you about them?',     'mission-runner'),
  ('Go somewhere alone',                 'A bar, a diner, a movie — go by yourself and sit with it.',                       'Travel',         'easy',   'What did the silence tell you?',     null),
  ('Say yes to something random',        'The next invitation you''d normally decline — accept it.',                        'Wild Night',     'medium', 'Where did ''yes'' take you?',         null),
  ('Ask someone their craziest story',   'Then tell it here (with their blessing, names removed).',                        'Funny',          'easy',   'What''s the wildest thing you heard?',null),
  ('Visit a bar you''ve never been to',  'Somewhere outside your usual orbit. Watch. Listen. Report back.',                 'Nightlife',      'medium', 'Who did you meet at the end of the bar?','local-legend'),
  ('Call someone you miss',              'Not text. Call. The person you keep meaning to.',                                 'Relationships',  'bold',   'What did you finally say?',          null),
  ('Do something that scares you a little','Small fear, real edge. Then write the moment before you did it.',               'Comeback Story', 'bold',   'What were you afraid of, really?',   null),
  ('Go to a local event and write what happened','Open mic, market, protest, show. Be a witness for the night.',           'Local',          'medium', 'What did the crowd reveal?',         'local-legend'),
  ('Write about the moment you almost left','A job, a city, a person, a life. The fork you stared down.',                   'Regret',         'bold',   'Why did you stay — or go?',          null)
on conflict do nothing;

-- ---------------------------------------------------- demo auth users --------
-- Placeholder accounts so the demo profiles have a valid user_id FK.
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','demo1@mous.local', crypt('demo-password', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','demo3@mous.local', crypt('demo-password', gen_salt('bf')), now(), now(), now())
on conflict (id) do nothing;

-- ------------------------------------------------------ demo profiles --------
-- (the handle_new_user trigger also fires; on_conflict keeps these explicit ones)
insert into public.profiles (id, user_id, anonymous_name, avatar_style, bio, is_admin) values
  ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000001','Midnight Witness','a8f3k2','I write down the things people say at 3am. Some of them were mine.', false),
  ('33333333-3333-3333-3333-333333333333','00000000-0000-0000-0000-000000000003','Ghost Typewriter','k4p7w2','Confessions, mostly. The kind you can only make to no one.', false)
on conflict (id) do update set anonymous_name = excluded.anonymous_name;

-- -------------------------------------------------------- demo stories -------
insert into public.stories
  (author_id, title, body, excerpt, category, mood, tags, truth_type, location_visibility, content_warning, status, featured, view_count, read_count)
values
  ('11111111-1111-1111-1111-111111111111',
   'The Last Glass of Water',
   E'The bar closed at two but nobody told the night.\n\nI was wiping down the last table when she sat at the counter and asked for water, not a drink. People who ask for water at closing time always have something to say.\n\nShe finished her water, left a twenty for a drink she never ordered, and walked back out into the dark.',
   'I was wiping down the last table when she sat at the counter and asked for water, not a drink…',
   'Nightlife','Emotional', array['closing time','strangers'], 'true_story','region', false,'published', true, 48210, 31880),
  ('33333333-3333-3333-3333-333333333333',
   'Two Hundred and Forty Buttons',
   E'My grandmother kept a tin of buttons. Hundreds of them. No two alike.\n\nWhen she died and I finally opened it, I understood it was a map. Every button came from a coat she''d given away.',
   'My grandmother kept a tin of buttons. When she died I finally understood it was a map…',
   'Family','Hopeful', array['grandmother','memory','kindness'], 'true_story','none', false,'published', true, 72400, 51200)
on conflict do nothing;

-- Done. The app reads everything else (reactions, reviews, follows) once users
-- interact. Badges + missions above are the catalogs the UI depends on.
