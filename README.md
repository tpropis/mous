# MOUS — *Stories without names.*

MOUS is an anonymous storytelling platform. People write real personal stories —
confessions, wild nights, lessons, heartbreaks, the moments they can't stop
thinking about — and receive real engagement (reads, reactions, reviews,
rankings, badges) **without ever revealing who they are.**

> Your name stays hidden. Your story does not.

This repository is a fully-structured, production-shaped Next.js application. It
runs immediately on rich seeded mock data, and is wired so every page can switch
to live Supabase with no change to component shapes.

---

## ✨ Features

| Area | What's inside |
| --- | --- |
| **Landing** | Cinematic dark hero, floating anonymous story cards, features, trending categories, trust section, final CTA |
| **Anonymous accounts** | Generated pen names ("Midnight Witness"), abstract deterministic avatars, private email, public-safe profiles |
| **Story editor** | Title/body, category, mood, tags, truth-type, location visibility, content warnings, word count, reading time, autosave, preview, confetti on publish |
| **Feed** | Trending / new / most-reviewed / most-emotional / most-mysterious / most-controversial / local sorts, search, multi-filter, random story, infinite scroll |
| **Story page** | Reading progress bar, content gate, reactions, emotional review system, related stories, share/bookmark/report |
| **Reviews** | Overall + 5-dimension ratings (writing, honesty, emotion, impact, entertainment), one-per-story anti-spam |
| **Reputation** | Reads/views/reviews, badges, streaks, top-writer rankings, anonymous followers |
| **Dashboard** | Private analytics — stat cards, growth chart, reactions breakdown, per-story analytics, recent reviews |
| **Explore** | All categories + moods, top writers, mood showcases |
| **Story Missions** | "Get Out There" prompts you accept, complete, and turn into stories |
| **Safety** | Reporting, blocking, content warnings, anonymity guidance, admin moderation dashboard |
| **Admin** | Manage stories, reports, reviews, users, platform stats |

---

## 🧱 Tech stack

- **Next.js 14** (App Router, RSC, server actions ready)
- **TypeScript** (strict)
- **Tailwind CSS** + custom design tokens
- **shadcn/ui-style** primitives (Radix UI), customized — not generic
- **Framer Motion** for animation/micro-interactions
- **Supabase** — auth, Postgres, storage, **row-level security**
- **React Hook Form + Zod** for forms/validation
- **Lucide** icons
- `canvas-confetti` for the publish celebration

---

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. (Optional) configure Supabase — the app runs on mock data without it
cp .env.example .env.local
#   then fill in NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Run the dev server
npm run dev
# → http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # next lint
npm run typecheck  # tsc --noEmit
```

> **No Supabase keys?** No problem. `src/lib/data.ts` serves seeded mock data so
> every page is fully browsable out of the box.

---

## 🗄️ Supabase setup

The full database lives in [`supabase/`](./supabase):

| File | Purpose |
| --- | --- |
| `schema.sql` | Tables, enums, indexes, triggers, the `profile_public` view, and helper functions (`is_admin()`, `current_profile_id()`, `handle_new_user()`) |
| `policies.sql` | Row-level security for every table |
| `seed.sql` | Badge + mission catalogs and demo content |

**Apply it:**

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run `schema.sql`, then `policies.sql`, then `seed.sql`.
3. Copy your project URL + anon key into `.env.local`.
4. (For admin/moderation server actions) add `SUPABASE_SERVICE_ROLE_KEY` —
   **server-only**, never exposed to the browser.

**Regenerating types:**

```bash
supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
```

The hand-authored `database.types.ts` already matches `schema.sql`, so this is a
drop-in replacement.

### Privacy & RLS guarantees

- Users can **read published stories** and anonymous-safe public data.
- Users can **only edit their own** stories, reviews, reactions, bookmarks.
- A user's **drafts and private rows** (bookmarks, mission progress) are visible
  only to them.
- **Real emails are never exposed** — they live solely in `auth.users` (outside
  the `public` schema) and no policy references it. The app reads identity only
  from `profiles` / `profile_public`, which contain no email or real name.
- **Admin-only** actions are gated by `is_admin()`.

---

## 📁 Project structure

```
src/
├── app/                      # App Router pages
│   ├── page.tsx              # Landing
│   ├── auth/                 # Anonymous auth + identity picker
│   ├── feed/                 # Interactive story feed
│   ├── explore/              # Categories, moods, top writers
│   ├── story/[id]/           # Reading experience
│   ├── write/                # Story editor
│   ├── missions/             # Story Missions
│   ├── dashboard/            # Private writer analytics
│   ├── profile/[anonymousName]/
│   ├── admin/                # Moderation dashboard
│   ├── privacy/ · terms/     # Trust pages
│   ├── layout.tsx · globals.css · providers.tsx
│   └── not-found · error · loading
├── components/
│   ├── ui/                   # shadcn-style primitives (customized)
│   ├── brand/ · layout/      # Logo, header, footer
│   ├── landing/ · common/    # Hero bg, reveal, section heading, empty state
│   ├── story/ · feed/ · explore/
│   ├── write/ · missions/ · dashboard/
│   ├── auth/ · profile/ · admin/
│   └── anon-avatar.tsx       # Abstract, deterministic avatars
├── lib/
│   ├── types.ts · constants.ts · utils.ts · anon.ts
│   ├── badges.ts · missions.ts
│   ├── data.ts               # Data-access layer (mock today, Supabase tomorrow)
│   ├── mock/                 # Seeded profiles + stories
│   └── supabase/             # client · server · middleware · database.types
├── middleware.ts             # Session refresh + route guards
docs/INTERNAL_API.md          # The build contract every page follows
supabase/                     # schema · policies · seed
```

---

## 🎨 Design system

Dark-mode first. Premium charcoal/black surfaces, soft gradients, glassmorphism
cards, and tasteful neon accents (violet / blue / rose / amber / teal). Tokens
live in `src/app/globals.css`; Tailwind extensions in `tailwind.config.ts`.
Utilities like `.glass`, `.text-gradient-brand`, and `.story-prose` keep the look
consistent. See [`docs/INTERNAL_API.md`](./docs/INTERNAL_API.md) for the full
component + data API.

---

## 🔌 Going live (mock → Supabase)

Every page calls the **data-access layer** in `src/lib/data.ts`, never mock
arrays directly. To go live, replace each function body with a Supabase query —
the return shapes already match the schema. The Supabase clients
(`src/lib/supabase/*`) and auth middleware are ready; `auth-form.tsx` marks where
`signUp` / `signInWithPassword` plug in.

---

## 🔒 A note on anonymity

MOUS is built so honesty feels safe. No real names, no public emails, no exact
locations by default. The editor reminds writers:

> *Stay anonymous. Do not include real names, private addresses, phone numbers,
> or identifying details unless you have permission.*

---

*Everyone has a story. Nobody needs your name.*
