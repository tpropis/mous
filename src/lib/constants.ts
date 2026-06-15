import type {
  FeedSort,
  LocationVisibility,
  MissionDifficulty,
  ReactionType,
  TruthType,
} from "./types";

/** Brand. */
export const BRAND = {
  name: "MOUS",
  tagline: "Stories without names.",
  taglines: [
    "Say what happened.",
    "No names. Just truth.",
    "Real stories. Unknown authors.",
    "Write what you could never post.",
    "Everyone has a story. Nobody needs your name.",
    "Anonymous stories from real people.",
  ],
} as const;

/** Story categories surfaced across Explore, the editor, and filters. */
export const CATEGORIES: { name: string; emoji: string; blurb: string }[] = [
  { name: "Nightlife", emoji: "🌃", blurb: "What happened after dark." },
  { name: "Relationships", emoji: "❤️", blurb: "Love, mess, and everything between." },
  { name: "Family", emoji: "🏠", blurb: "The people you didn't choose." },
  { name: "Work", emoji: "💼", blurb: "What really goes on at the office." },
  { name: "Politics", emoji: "🗳️", blurb: "The things you can't say out loud." },
  { name: "School", emoji: "🎒", blurb: "Hallways, classrooms, and chaos." },
  { name: "Sports", emoji: "🏟️", blurb: "Glory, defeat, and the locker room." },
  { name: "Faith", emoji: "🕯️", blurb: "Belief, doubt, and the search." },
  { name: "Regret", emoji: "🕳️", blurb: "The ones that still sting." },
  { name: "Confession", emoji: "🤫", blurb: "What you've never told anyone." },
  { name: "Funny", emoji: "😂", blurb: "You had to be there." },
  { name: "Dark Humor", emoji: "🖤", blurb: "Laugh so you don't cry." },
  { name: "Mystery", emoji: "🔍", blurb: "Things that never added up." },
  { name: "Travel", emoji: "✈️", blurb: "Far from home, close to yourself." },
  { name: "Local", emoji: "📍", blurb: "Stories from your corner of the world." },
  { name: "Comeback Story", emoji: "🔥", blurb: "How you climbed back." },
  { name: "Life Lesson", emoji: "🧭", blurb: "What it finally taught you." },
  { name: "Wild Night", emoji: "🎲", blurb: "The night that got out of hand." },
  { name: "Unsent Message", emoji: "✉️", blurb: "What you never sent." },
  { name: "Revenge", emoji: "⚔️", blurb: "Served, plotted, or imagined." },
  { name: "First Time", emoji: "🌱", blurb: "The first of something." },
  { name: "Last Time", emoji: "🌒", blurb: "The last of something." },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

/** Emotional moods used for tagging and filtering. */
export const MOODS: { name: string; emoji: string; color: string }[] = [
  { name: "Funny", emoji: "😂", color: "text-neon-amber" },
  { name: "Sad", emoji: "😢", color: "text-neon-blue" },
  { name: "Angry", emoji: "😠", color: "text-neon-rose" },
  { name: "Hopeful", emoji: "🌅", color: "text-neon-teal" },
  { name: "Dark", emoji: "🌑", color: "text-muted-foreground" },
  { name: "Romantic", emoji: "💘", color: "text-neon-rose" },
  { name: "Chaotic", emoji: "🌀", color: "text-neon-violet" },
  { name: "Inspirational", emoji: "✨", color: "text-neon-amber" },
  { name: "Strange", emoji: "🛸", color: "text-neon-teal" },
  { name: "Embarrassing", emoji: "🙈", color: "text-neon-rose" },
  { name: "Honest", emoji: "🪞", color: "text-neon-blue" },
  { name: "Emotional", emoji: "🥹", color: "text-neon-violet" },
  { name: "Unbelievable", emoji: "🤯", color: "text-neon-amber" },
];

export const MOOD_NAMES = MOODS.map((m) => m.name);

export const TRUTH_TYPES: { value: TruthType; label: string; hint: string }[] = [
  { value: "true_story", label: "True story", hint: "It happened. Exactly like this." },
  { value: "inspired", label: "Inspired by real life", hint: "Mostly real, slightly shaped." },
  { value: "fictionalized", label: "Fictionalized", hint: "Real feeling, changed details." },
  { value: "confession", label: "Anonymous confession", hint: "Something you needed to say." },
];

export const LOCATION_OPTIONS: {
  value: LocationVisibility;
  label: string;
  hint: string;
}[] = [
  { value: "none", label: "No location", hint: "Keep it completely placeless." },
  { value: "region", label: "General region", hint: "e.g. The Midwest" },
  { value: "state", label: "State only", hint: "e.g. California" },
  { value: "city", label: "City only", hint: "e.g. Austin" },
];

/** Reaction palette — each has a label, emoji, and accent for micro-animations. */
export const REACTIONS: {
  type: ReactionType;
  label: string;
  emoji: string;
  accent: string;
}[] = [
  { type: "felt", label: "I felt this", emoji: "🫶", accent: "neon-rose" },
  { type: "wild", label: "Wild", emoji: "🤯", accent: "neon-amber" },
  { type: "beautiful", label: "Beautiful", emoji: "🌸", accent: "neon-rose" },
  { type: "painful", label: "Painful", emoji: "🥀", accent: "neon-blue" },
  { type: "funny", label: "Funny", emoji: "😂", accent: "neon-amber" },
  { type: "unbelievable", label: "Unbelievable", emoji: "👀", accent: "neon-teal" },
  { type: "say_more", label: "Say more", emoji: "🗣️", accent: "neon-violet" },
  { type: "changed_me", label: "This changed me", emoji: "🌀", accent: "neon-violet" },
];

export const REACTION_LABEL: Record<ReactionType, string> = REACTIONS.reduce(
  (acc, r) => ({ ...acc, [r.type]: r.label }),
  {} as Record<ReactionType, string>,
);

export const FEED_SORTS: { value: FeedSort; label: string; emoji: string }[] = [
  { value: "trending", label: "Trending", emoji: "🔥" },
  { value: "new", label: "New", emoji: "✨" },
  { value: "most_reviewed", label: "Most reviewed", emoji: "💬" },
  { value: "most_emotional", label: "Most emotional", emoji: "🥹" },
  { value: "most_mysterious", label: "Most mysterious", emoji: "🔍" },
  { value: "most_controversial", label: "Most controversial", emoji: "⚡" },
  { value: "local", label: "Local", emoji: "📍" },
];

export const REVIEW_DIMENSIONS: { key: string; label: string }[] = [
  { key: "writing_score", label: "Writing" },
  { key: "honesty_score", label: "Honesty" },
  { key: "emotion_score", label: "Emotion" },
  { key: "impact_score", label: "Impact" },
  { key: "entertainment_score", label: "Entertainment" },
];

export const DIFFICULTY_META: Record<
  MissionDifficulty,
  { label: string; color: string }
> = {
  easy: { label: "Easy", color: "text-neon-teal" },
  medium: { label: "Medium", color: "text-neon-amber" },
  bold: { label: "Bold", color: "text-neon-rose" },
};

/** Inspirational editor prompts shown in the writing flow. */
export const EDITOR_PROMPTS: string[] = [
  "What happened?",
  "What did you never get to say?",
  "What did that night teach you?",
  "What is something you remember too clearly?",
  "What story would you tell if nobody knew it was you?",
  "Write the thing you still think about.",
  "What is the moment you almost left?",
];

export const CONTENT_GUIDELINE =
  "Stay anonymous. Do not include real names, private addresses, phone numbers, or identifying details unless you have permission.";

/** Navigation used by the app header. */
export const NAV_LINKS = [
  { href: "/feed", label: "Feed" },
  { href: "/explore", label: "Explore" },
  { href: "/missions", label: "Missions" },
] as const;
