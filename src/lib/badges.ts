import type { Badge } from "./types";

/**
 * Badge catalog. `requirement_type` + `threshold` describe how a badge is earned;
 * the actual awarding happens server-side (a Supabase function in production).
 */
export const BADGES: Badge[] = [
  {
    id: "first-story",
    name: "First Story",
    description: "You published your first story. The hardest one is behind you.",
    icon: "Sparkles",
    requirement_type: "first_story",
    accent: "neon.violet",
  },
  {
    id: "reads-1k",
    name: "1,000 Reads",
    description: "A thousand people read what you wrote.",
    icon: "BookOpen",
    requirement_type: "reads",
    threshold: 1000,
    accent: "neon.blue",
  },
  {
    id: "reads-10k",
    name: "10,000 Reads",
    description: "Ten thousand reads. Your words travel further than your name.",
    icon: "Flame",
    requirement_type: "reads",
    threshold: 10000,
    accent: "neon.amber",
  },
  {
    id: "most-felt",
    name: "Most Felt",
    description: "Your story collected more 'I felt this' than any other this week.",
    icon: "Heart",
    requirement_type: "reactions",
    threshold: 500,
    accent: "neon.rose",
  },
  {
    id: "midnight-writer",
    name: "Midnight Writer",
    description: "You published between midnight and 4am. The quiet hours suit you.",
    icon: "Moon",
    requirement_type: "streak",
    accent: "neon.violet",
  },
  {
    id: "truth-teller",
    name: "Truth Teller",
    description: "Ten true stories, no embellishment. Honesty has a fan club.",
    icon: "ShieldCheck",
    requirement_type: "rating",
    threshold: 10,
    accent: "neon.teal",
  },
  {
    id: "ghost-author",
    name: "Ghost Author",
    description: "A full month of writing without a single identifying detail.",
    icon: "Ghost",
    requirement_type: "streak",
    threshold: 30,
    accent: "neon.blue",
  },
  {
    id: "local-legend",
    name: "Local Legend",
    description: "The most-read author in your region.",
    icon: "MapPin",
    requirement_type: "local",
    accent: "neon.amber",
  },
  {
    id: "viral-story",
    name: "Viral Story",
    description: "One story crossed 50,000 views in a week.",
    icon: "TrendingUp",
    requirement_type: "reads",
    threshold: 50000,
    accent: "neon.rose",
  },
  {
    id: "deep-cut",
    name: "Deep Cut",
    description: "A story with a 4.8+ rating and fewer than 1,000 reads. A hidden gem.",
    icon: "Gem",
    requirement_type: "rating",
    accent: "neon.teal",
  },
  {
    id: "crowd-favorite",
    name: "Crowd Favorite",
    description: "100+ reviews averaging 4.5 stars.",
    icon: "Star",
    requirement_type: "reviews",
    threshold: 100,
    accent: "neon.amber",
  },
  {
    id: "mission-runner",
    name: "Mission Runner",
    description: "You completed 5 Story Missions. You actually went out there.",
    icon: "Compass",
    requirement_type: "mission",
    threshold: 5,
    accent: "neon.violet",
  },
];

export function getBadge(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}
