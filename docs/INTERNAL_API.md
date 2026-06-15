# MOUS — Internal build reference

This document is the contract every page is built against. Use these exports; do
not re-implement them. Dark mode is always on (`<html class="dark">`).

## Path alias

`@/` → `src/`. e.g. `import { Button } from "@/components/ui/button"`.

## Design tokens (Tailwind)

- Surfaces: `bg-background`, `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`.
- Brand accents: `text-neon-violet`, `neon-blue`, `neon-rose`, `neon-amber`, `neon-teal` (also `bg-*`, `from-*`).
- Primary: `bg-primary text-primary-foreground` (violet).
- Utilities (globals.css): `.glass`, `.glass-strong`, `.text-gradient-brand`, `.glow-violet`, `.bg-grid-faint`, `.no-scrollbar`, `.story-prose`, `.mask-fade-b`.
- Animations: `animate-float`, `animate-pulse-ring`, `animate-shimmer`, `animate-fade-up`, `animate-gradient-pan`.
- Radius is generous (`rounded-2xl` on cards, `rounded-full` on buttons/badges).

## UI primitives — `@/components/ui/*`

- `button` → `Button` (variants: `default | brand | destructive | outline | secondary | ghost | glass | link`; sizes: `default | sm | lg | icon`; supports `asChild`).
- `card` → `Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter`.
- `badge` → `Badge` (variants: `default | secondary | outline | glass | destructive | warn`).
- `input` → `Input`; `textarea` → `Textarea`; `label` → `Label`.
- `select` → `Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel, SelectGroup`.
- `tabs` → `Tabs, TabsList, TabsTrigger, TabsContent`.
- `dialog` → `Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose`.
- `dropdown-menu` → `DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator`.
- `avatar` → `Avatar, AvatarImage, AvatarFallback` (rarely needed; prefer AnonAvatar).
- `tooltip` → `Tooltip, TooltipTrigger, TooltipContent` (TooltipProvider already mounted at root).
- `popover` → `Popover, PopoverTrigger, PopoverContent`.
- `switch` → `Switch`; `progress` → `Progress` (has `indicatorClassName`); `separator` → `Separator`; `skeleton` → `Skeleton`.
- Toasts: `import { useToast } from "@/components/ui/toaster"` then `const { toast } = useToast(); toast({ title, description?, variant?: "default"|"success"|"error"|"info" })`. Provider already mounted.

## Shared components

- `@/components/anon-avatar` → `<AnonAvatar seed={profile.avatar_style} name={profile.anonymous_name} size={40} />` — deterministic gradient sigil. Never a face.
- `@/components/story/story-card` → `<StoryCard story={story} index={i} variant="default|featured|compact" />`.
- `@/components/story/reaction-bar` → `<ReactionBar initial={story.reactions} />`.
- `@/components/story/story-meta` → `MoodBadge, CategoryBadge, TruthBadge, StoryLocation, ContentWarning` (all take props as named).
- `@/components/common/section-heading` → `<SectionHeading eyebrow title description href hrefLabel align="left|center" />`.
- `@/components/common/empty-state` → `<EmptyState icon={LucideIcon} title description action={<Button/>} />`.
- `@/components/common/reveal` → `<Reveal delay y className>` scroll-in wrapper (client).
- `@/components/brand/logo` → `<Logo showTagline href />`.

## Data layer — `@/lib/data` (returns mock data shaped exactly like Supabase rows)

- `getStories(filters?: FeedFilters): Story[]` — FeedFilters: `{ sort?: FeedSort, category?, mood?, truthType?, locationVisibility?, search?, maxMinutes?, missionOnly? }`.
- `getFeaturedStories(): Story[]`, `getStory(id): Story | undefined`, `getRelatedStories(story, limit?)`, `getRandomStory(): Story`.
- `getReviews(storyId): StoryReview[]`, `getStoriesByAuthor(authorId): Story[]`.
- `getProfile(name): Profile | undefined`, `getCurrentProfile(): Profile`, `getTopWriters(limit?): Profile[]`.
- `MISSIONS: Mission[]`, `BADGES: Badge[]` (re-exported). Also `getMission(id)` from `@/lib/missions`, `getBadge(id)` from `@/lib/badges`.

## Constants — `@/lib/constants`

`BRAND` ({name, tagline, taglines[]}), `CATEGORIES` ([{name,emoji,blurb}]), `CATEGORY_NAMES`, `MOODS` ([{name,emoji,color}]), `MOOD_NAMES`, `TRUTH_TYPES` ([{value,label,hint}]), `LOCATION_OPTIONS`, `REACTIONS`, `REACTION_LABEL`, `FEED_SORTS`, `REVIEW_DIMENSIONS`, `DIFFICULTY_META`, `EDITOR_PROMPTS`, `CONTENT_GUIDELINE`, `NAV_LINKS`.

## Types — `@/lib/types`

`Profile, ProfileStats, Story, StoryReview, ReviewSummary, ReactionSummary, ReactionType, StoryReaction, Bookmark, Follow, Mission, UserMission, Report, Badge, UserBadge, TruthType, LocationVisibility, MissionDifficulty, FeedSort, StoryStatus`.

## Utils — `@/lib/utils`

`cn(...)`, `formatCompact(n)`, `timeAgo(iso)`, `readingTimeMinutes(text)`, `wordCount(text)`, `truncate(text,max)`, `slugify(s)`, `pluralize(n,s,p?)`, `hashToIndex(s,max)`.

## Anon — `@/lib/anon`

`generateAnonName()`, `suggestAnonNames(count)`, `generateAvatarSeed()`, `nameToSlug(name)`, `slugToName(slug)`.

## Rules

- Mobile-first, responsive. Use `container` for page width.
- Client components need `"use client"`. Pages can be server components composing client pieces.
- NEVER render real names/emails — only `anonymous_name` + `AnonAvatar`.
- Use `toast` for action feedback. Provide loading/empty/error states.
- Add concise comments on non-obvious logic.
