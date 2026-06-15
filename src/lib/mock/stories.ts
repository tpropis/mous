import type {
  ReactionSummary,
  ReviewSummary,
  Story,
  StoryReview,
} from "../types";
import { readingTimeMinutes, truncate, wordCount } from "../utils";

/** Build a full reaction summary from a partial map (missing keys -> 0). */
function reactions(partial: Partial<ReactionSummary>): ReactionSummary {
  return {
    felt: 0,
    wild: 0,
    beautiful: 0,
    painful: 0,
    funny: 0,
    unbelievable: 0,
    say_more: 0,
    changed_me: 0,
    ...partial,
  };
}

function reviewSummary(
  count: number,
  scores: [number, number, number, number, number],
): ReviewSummary {
  const [writing, honesty, emotion, impact, entertainment] = scores;
  const average =
    Math.round(((writing + honesty + emotion + impact + entertainment) / 5) * 10) /
    10;
  return { count, average, writing, honesty, emotion, impact, entertainment };
}

/** Raw story bodies kept separate for readability. */
const BODIES: Record<string, string> = {
  s1: `The bar closed at two but nobody told the night.

I was wiping down the last table when she sat at the counter and asked for water, not a drink. People who ask for water at closing time always have something to say. I learned that in eleven years of bartending.

She'd left her wedding the night before. Not the marriage — the wedding. Walked out of the rehearsal dinner, drove four hours, and stopped here because the neon sign was the only thing still on. She wasn't crying. She was doing that thing where you're too calm, like the storm already happened somewhere I couldn't see.

"Do you think people can tell when they're making the biggest mistake of their life?" she asked.

I told her the truth: that the biggest mistakes never feel like mistakes. They feel like relief. That's how you know.

She finished her water, left a twenty for a drink she never ordered, and walked back out into the dark. I never saw her again. But every closing time since, I leave one stool empty, just in case the night sends someone else who needs a glass of water and a stranger who won't ask their name.`,
  s2: `My grandmother kept a tin of buttons. Hundreds of them. No two alike.

When I was small I thought it was treasure. When I was a teenager I thought it was hoarding. When she died and I finally opened it, I understood it was a map.

Every button came from a coat she'd given away. She lived through a war where you didn't throw anything out, and when she had enough to give, she cut one button off every coat before donating it. "So a part of it stays warm with us," she said once, and I didn't listen because I was sixteen and listening felt like losing.

There were two hundred and forty buttons in that tin. Two hundred and forty coats. Two hundred and forty strangers walking around somewhere warmer because of a woman whose name they never knew.

I keep the tin on my desk now. When I do something small and good and no one notices, I add a button. I'm up to nine. It's not many. But she didn't start with two hundred and forty either.`,
  s3: `I have to tell someone this and it can't be anyone who knows me.

For three years I've been sending money to a man I've never met. It started as a scam — one of those texts, "wrong number," then a friendly chat, then a story about a sick daughter. I knew. I want to be clear that I knew the whole time.

But I was so lonely that being needed, even fraudulently, felt like the only real thing in my week. He'd message good morning. He remembered I don't like Mondays. The scammer knew me better than my actual family did, and I paid for that. Literally. Eleven thousand dollars over three years.

Last month the messages stopped. And the thing I felt wasn't relief that the scam was over. It was grief. I miss him. I miss a person who never existed, who was probably three people in a building somewhere reading from a script.

I'm not asking for sympathy. I'm asking whether the loneliness was the scam, and he was just the invoice.`,
  s4: `We snuck onto the roof of the parking garage because someone said you could see the whole city from there. You couldn't, really. You could see a Wendy's and a lot of brake lights. But we were nineteen and everything looked like a postcard if you squinted.

Marcus brought a speaker. Dana brought the kind of confidence that makes terrible ideas sound like plans. I brought nothing but I was there, and at nineteen being there is the whole job.

We stayed until the sky did that thing it does at 5am where it can't decide what color to be. Nobody wanted to be the first to say we should go home, because going home meant admitting the night was a thing that ended.

I've been to better parties. Rooftops with actual views, people whose names I'd recognize now. But I'd trade every one of them to be back on that ugly garage roof, broke and certain that we'd all stay exactly this close forever.

We didn't, of course. That's not the sad part. The sad part is that we knew we wouldn't, and we stayed anyway.`,
  s5: `My manager took credit for my project in front of the whole company. I smiled. I clapped. Then I went home and built a spreadsheet.

Not an angry spreadsheet. A patient one. Every idea I'd had, dated, with the email timestamps that proved I'd sent them first. I wasn't going to do anything with it. It was just a place to put the rage so it didn't put itself somewhere worse.

Eight months later, an executive asked me directly, in a meeting, where a certain strategy had come from. My manager opened his mouth. I opened my laptop.

I didn't gloat. I didn't even look at him. I just shared my screen and let the timestamps speak in their flat, unarguable little font. Revenge, it turns out, is best served as a properly formatted document.

He left the company that quarter. I got his job. And I still keep the spreadsheet, not because I need it, but because everyone should have a quiet place to put the rage until the day it can speak for itself.`,
  s6: `I wrote you a letter every year on the day you left and never sent a single one.

The first year it was angry. The second year it was bargaining, page after page of what I'd do differently. By the fifth year the letters got shorter, and by the seventh they were just one line: "I hope wherever you are has good coffee."

This is the tenth one. I'm not going to send it either, but I'm going to put it somewhere a stranger might read it, which feels closer to sending than the shoebox under my bed ever did.

So, to whoever you are, reading this instead of the person it's for: he had a laugh that started in his shoulders. He couldn't parallel park to save his life. He told me once that I was the only place he'd ever felt was home, and then he made me homeless with one phone call.

I forgive him. Not for his sake. I just got tired of carrying it. If you're holding a letter you've never sent — send it, or set it down. Ten years is a long time to hold a pen.`,
  s7: `The night I almost left, I packed one bag and sat in the car in the driveway for forty minutes.

I had the address of a motel two states away. I had enough cash to disappear for a while. I had every reason that any reasonable person would have agreed with. And I had my hand on the gear shift the entire time, not moving it.

What stopped me wasn't love or duty or any of the noble things. It was a sound. The upstairs light clicked on, and through the window I saw my daughter get up for water, the way she does, rubbing her eyes, padding down the hall in those dinosaur socks she refuses to retire.

She didn't know I was out there. She didn't know there was anything to know. And that was the whole point — that her world was still whole, and I was the one holding the seam.

I put the bag back. I didn't fix anything that night. Things stayed hard for a long time. But I learned that leaving and staying are both just decisions you make once and then keep making, every single morning, in the dark, with your hand on the gear shift.`,
  s8: `I served the worst customer of my career a perfect meal and I have never been prouder.

He was rude from the second he sat down. Snapped his fingers. Called me "hey you." Sent the bread back because it was "bread-shaped." My coworkers wanted me to spit in his soup, the classic fantasy, but I had a better idea.

I gave him the best service of his miserable life. I remembered everything. I anticipated everything. I was so relentlessly, weaponizingly kind that by the end of the night he had nothing to push against. You can't fight someone who refuses to give you a wall.

When he left he tipped forty percent and mumbled something that might have been "sorry." I'll never know what was happening in his life that made him walk in like that. Probably something I'd have written a story about if it were mine.

Kindness as revenge. Try it. It ruins their whole night.`,
};

/** Seed stories. Bodies are full, excerpts derived, counts realistic. */
export const MOCK_STORIES: Story[] = [
  {
    id: "s1",
    author_id: "p1",
    title: "The Last Glass of Water",
    body: BODIES.s1,
    excerpt: truncate(BODIES.s1.replace(/\n+/g, " "), 180),
    category: "Nightlife",
    mood: "Emotional",
    tags: ["closing time", "strangers", "bartending"],
    truth_type: "true_story",
    location_visibility: "region",
    city: null,
    state: null,
    content_warning: false,
    status: "published",
    featured: true,
    view_count: 48_210,
    read_count: 31_880,
    created_at: "2026-06-10T03:12:00Z",
    updated_at: "2026-06-10T03:12:00Z",
    reactions: reactions({ felt: 1840, beautiful: 920, painful: 410, say_more: 230 }),
    review_summary: reviewSummary(312, [4.8, 4.9, 4.9, 4.7, 4.5]),
  },
  {
    id: "s2",
    author_id: "p3",
    title: "Two Hundred and Forty Buttons",
    body: BODIES.s2,
    excerpt: truncate(BODIES.s2.replace(/\n+/g, " "), 180),
    category: "Family",
    mood: "Hopeful",
    tags: ["grandmother", "memory", "kindness"],
    truth_type: "true_story",
    location_visibility: "none",
    city: null,
    state: null,
    content_warning: false,
    status: "published",
    featured: true,
    view_count: 72_400,
    read_count: 51_200,
    created_at: "2026-06-08T14:05:00Z",
    updated_at: "2026-06-08T14:05:00Z",
    reactions: reactions({ felt: 3210, beautiful: 2870, changed_me: 1410 }),
    review_summary: reviewSummary(540, [4.9, 5.0, 4.9, 4.8, 4.6]),
  },
  {
    id: "s3",
    author_id: "p3",
    title: "The Invoice",
    body: BODIES.s3,
    excerpt: truncate(BODIES.s3.replace(/\n+/g, " "), 180),
    category: "Confession",
    mood: "Honest",
    tags: ["loneliness", "scam", "confession"],
    truth_type: "confession",
    location_visibility: "none",
    city: null,
    state: null,
    content_warning: true,
    content_warning_label: "Discusses loneliness and financial harm",
    status: "published",
    featured: false,
    view_count: 91_300,
    read_count: 60_120,
    created_at: "2026-06-11T23:40:00Z",
    updated_at: "2026-06-11T23:40:00Z",
    reactions: reactions({ felt: 2210, painful: 3100, unbelievable: 1980, say_more: 640 }),
    review_summary: reviewSummary(721, [4.7, 5.0, 4.9, 4.8, 4.3]),
  },
  {
    id: "s4",
    author_id: "p4",
    title: "The Ugliest Rooftop in the World",
    body: BODIES.s4,
    excerpt: truncate(BODIES.s4.replace(/\n+/g, " "), 180),
    category: "Wild Night",
    mood: "Emotional",
    tags: ["youth", "friends", "nostalgia"],
    truth_type: "inspired",
    location_visibility: "city",
    city: "Austin",
    state: "Texas",
    content_warning: false,
    status: "published",
    featured: false,
    view_count: 33_900,
    read_count: 19_440,
    created_at: "2026-06-09T19:25:00Z",
    updated_at: "2026-06-09T19:25:00Z",
    reactions: reactions({ felt: 1420, beautiful: 760, painful: 540, funny: 120 }),
    review_summary: reviewSummary(204, [4.6, 4.7, 4.8, 4.5, 4.6]),
  },
  {
    id: "s5",
    author_id: "p5",
    title: "A Properly Formatted Revenge",
    body: BODIES.s5,
    excerpt: truncate(BODIES.s5.replace(/\n+/g, " "), 180),
    category: "Work",
    mood: "Chaotic",
    tags: ["office", "revenge", "patience"],
    truth_type: "inspired",
    location_visibility: "none",
    city: null,
    state: null,
    content_warning: false,
    status: "published",
    featured: true,
    view_count: 58_700,
    read_count: 41_010,
    created_at: "2026-06-07T12:00:00Z",
    updated_at: "2026-06-07T12:00:00Z",
    reactions: reactions({ wild: 2100, funny: 1840, changed_me: 410, say_more: 320 }),
    review_summary: reviewSummary(389, [4.5, 4.4, 4.2, 4.6, 4.9]),
  },
  {
    id: "s6",
    author_id: "p6",
    title: "The Tenth Letter",
    body: BODIES.s6,
    excerpt: truncate(BODIES.s6.replace(/\n+/g, " "), 180),
    category: "Unsent Message",
    mood: "Sad",
    tags: ["grief", "letters", "forgiveness"],
    truth_type: "true_story",
    location_visibility: "none",
    city: null,
    state: null,
    content_warning: false,
    status: "published",
    featured: false,
    view_count: 44_220,
    read_count: 29_870,
    created_at: "2026-06-06T08:30:00Z",
    updated_at: "2026-06-06T08:30:00Z",
    reactions: reactions({ felt: 2640, beautiful: 1920, painful: 2210, changed_me: 980 }),
    review_summary: reviewSummary(298, [4.9, 5.0, 5.0, 4.9, 4.4]),
  },
  {
    id: "s7",
    author_id: "p1",
    title: "Forty Minutes in the Driveway",
    body: BODIES.s7,
    excerpt: truncate(BODIES.s7.replace(/\n+/g, " "), 180),
    category: "Regret",
    mood: "Honest",
    tags: ["parenthood", "almost left", "choices"],
    truth_type: "true_story",
    location_visibility: "state",
    city: null,
    state: "Ohio",
    content_warning: true,
    content_warning_label: "Themes of leaving and family strain",
    status: "published",
    featured: false,
    view_count: 39_100,
    read_count: 25_640,
    created_at: "2026-06-12T01:15:00Z",
    updated_at: "2026-06-12T01:15:00Z",
    reactions: reactions({ felt: 1980, painful: 1640, changed_me: 1210, say_more: 410 }),
    review_summary: reviewSummary(266, [4.8, 4.9, 4.9, 4.9, 4.4]),
  },
  {
    id: "s8",
    author_id: "p5",
    title: "Kindness as a Weapon",
    body: BODIES.s8,
    excerpt: truncate(BODIES.s8.replace(/\n+/g, " "), 180),
    category: "Funny",
    mood: "Funny",
    tags: ["service industry", "revenge", "kindness"],
    truth_type: "true_story",
    location_visibility: "none",
    city: null,
    state: null,
    content_warning: false,
    status: "published",
    featured: false,
    view_count: 51_600,
    read_count: 36_220,
    created_at: "2026-06-05T17:45:00Z",
    updated_at: "2026-06-05T17:45:00Z",
    reactions: reactions({ funny: 3420, wild: 1100, changed_me: 620, felt: 540 }),
    review_summary: reviewSummary(351, [4.6, 4.7, 4.4, 4.5, 4.9]),
  },
];

// Attach derived reading times.
MOCK_STORIES.forEach((s) => {
  s.reading_minutes = readingTimeMinutes(s.body);
});

/** Reviews for the story detail page. */
export const MOCK_REVIEWS: StoryReview[] = [
  {
    id: "r1",
    story_id: "s1",
    reviewer_id: "p2",
    rating: 5,
    writing_score: 5,
    honesty_score: 5,
    emotion_score: 5,
    impact_score: 5,
    entertainment_score: 4,
    review_text:
      "The empty stool detail wrecked me. You wrote a whole life in one closing shift.",
    created_at: "2026-06-10T09:00:00Z",
    reviewer: { anonymous_name: "The Blue Stranger", avatar_style: "z1m9q4" },
  },
  {
    id: "r2",
    story_id: "s1",
    reviewer_id: "p6",
    rating: 5,
    writing_score: 5,
    honesty_score: 5,
    emotion_score: 5,
    impact_score: 4,
    entertainment_score: 5,
    review_text: "“The biggest mistakes feel like relief.” I'm going to think about that for a week.",
    created_at: "2026-06-10T11:30:00Z",
    reviewer: { anonymous_name: "Velvet Raven", avatar_style: "v7c2l9" },
  },
  {
    id: "r3",
    story_id: "s2",
    reviewer_id: "p1",
    rating: 5,
    writing_score: 5,
    honesty_score: 5,
    emotion_score: 5,
    impact_score: 5,
    entertainment_score: 4,
    review_text: "Nine buttons. I started one too after reading this. Thank you.",
    created_at: "2026-06-08T20:00:00Z",
    reviewer: { anonymous_name: "Midnight Witness", avatar_style: "a8f3k2" },
  },
];

export function getStoryById(id: string): Story | undefined {
  return MOCK_STORIES.find((s) => s.id === id);
}

export function getReviewsForStory(storyId: string): StoryReview[] {
  return MOCK_REVIEWS.filter((r) => r.story_id === storyId);
}

export { wordCount };
