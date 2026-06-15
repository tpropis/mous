/**
 * Anonymous identity helpers.
 * MOUS never exposes a real name. Every user gets a generated pen name and an
 * abstract, deterministic avatar seed. None of this is derived from PII.
 */

const ADJECTIVES = [
  "Blue",
  "Midnight",
  "Silent",
  "Velvet",
  "Crimson",
  "Hollow",
  "Golden",
  "Electric",
  "Quiet",
  "Restless",
  "Ghost",
  "Paper",
  "Neon",
  "Wandering",
  "Faded",
  "Lonesome",
  "Static",
  "Smoke",
  "Glass",
  "Iron",
];

const NOUNS = [
  "Stranger",
  "Fox",
  "Witness",
  "Typewriter",
  "Wanderer",
  "Specter",
  "Drifter",
  "Echo",
  "Moth",
  "Lantern",
  "Pilgrim",
  "Raven",
  "Nomad",
  "Phantom",
  "Sparrow",
  "Wolf",
  "Mirror",
  "Comet",
  "Vagrant",
  "Shadow",
];

const PREFIXED = ["Mous", "NoName", "Anon", "Unknown", "Nobody"];

/** Pick a random element. */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a random anonymous pen name. Produces three flavors:
 *  - "Mous 1847"        (prefixed + number)
 *  - "The Blue Stranger"(article + adjective + noun)
 *  - "NoName Fox"       (prefix + noun)
 */
export function generateAnonName(): string {
  const flavor = Math.floor(Math.random() * 3);
  switch (flavor) {
    case 0:
      return `${pick(PREFIXED)} ${1000 + Math.floor(Math.random() * 9000)}`;
    case 1:
      return `The ${pick(ADJECTIVES)} ${pick(NOUNS)}`;
    default:
      return `${pick(PREFIXED)} ${pick(NOUNS)}`;
  }
}

/** A handful of suggestions for the picker UI. */
export function suggestAnonNames(count = 5): string[] {
  const set = new Set<string>();
  let guard = 0;
  while (set.size < count && guard < count * 8) {
    set.add(generateAnonName());
    guard++;
  }
  return Array.from(set);
}

/** Avatar seed — opaque string the avatar component renders into a gradient sigil. */
export function generateAvatarSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Map a name to a stable URL-safe slug used for /profile/[anonymousName]. */
export function nameToSlug(name: string): string {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"));
}

export function slugToName(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, " ");
}
