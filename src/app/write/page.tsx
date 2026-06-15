import Link from "next/link";
import { ArrowLeft, PenLine, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StoryEditor } from "@/components/write/story-editor";
import { getMission } from "@/lib/missions";

/** Read a possibly-array search param as a single string. */
function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

interface WritePageProps {
  searchParams: {
    mission?: string | string[];
  };
}

export default function WritePage({ searchParams }: WritePageProps) {
  const missionId = single(searchParams.mission);
  const mission = missionId ? getMission(missionId) : undefined;

  return (
    <div className="container py-10 sm:py-14">
      {/* ----------------------------------------------------------- Header */}
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/feed">
            <ArrowLeft className="h-4 w-4" />
            Back to feed
          </Link>
        </Button>

        <Badge variant="glass" className="mb-4 px-4 py-1.5 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-neon-violet" />
          Anonymous by default
        </Badge>

        <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight sm:text-5xl">
          <PenLine className="h-8 w-8 text-neon-violet" />
          Write your <span className="text-gradient-brand">story</span>
        </h1>
        <p className="mt-3 max-w-2xl text-balance text-lg text-muted-foreground">
          {mission
            ? `Mission accepted: “${mission.title}.” Write what happened — no names, just truth.`
            : "Say what happened. No name attached, no face shown — just the moment you can't stop thinking about."}
        </p>
      </div>

      <StoryEditor missionPrompt={mission?.prompt} />
    </div>
  );
}
