import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FeedExperience } from "@/components/feed/feed-experience";
import { getStories } from "@/lib/queries";

/** Read a possibly-array search param as a single string. */
function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

interface FeedPageProps {
  searchParams: {
    sort?: string | string[];
    category?: string | string[];
    search?: string | string[];
    focus?: string | string[];
  };
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const initialSort = single(searchParams.sort);
  const initialCategory = single(searchParams.category);
  const initialSearch = single(searchParams.search);
  const initialFocus = single(searchParams.focus);

  // Fetch all published stories on the server; the client filters/sorts in-memory.
  const initialStories = await getStories();

  return (
    <div className="container py-10 sm:py-14">
      {/* ----------------------------------------------------------- Header */}
      <div className="mb-8 max-w-2xl">
        <Badge variant="glass" className="mb-4 px-4 py-1.5 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-neon-violet" />
          Anonymous stories from real people
        </Badge>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          The <span className="text-gradient-brand">Feed</span>
        </h1>
        <p className="mt-3 text-balance text-lg text-muted-foreground">
          Confessions, wild nights, heartbreaks, and the moments people can&apos;t
          stop thinking about. No names — just truth. Sort by what you&apos;re in
          the mood to feel.
        </p>
      </div>

      <FeedExperience
        initialStories={initialStories}
        initialSort={initialSort}
        initialCategory={initialCategory}
        initialSearch={initialSearch}
        initialFocus={initialFocus}
      />
    </div>
  );
}
