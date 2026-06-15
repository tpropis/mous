import { AlertTriangle, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MOODS, TRUTH_TYPES } from "@/lib/constants";
import type { Story } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MoodBadge({ mood, className }: { mood: string; className?: string }) {
  const meta = MOODS.find((m) => m.name === mood);
  return (
    <Badge variant="glass" className={cn("gap-1", className)}>
      <span>{meta?.emoji ?? "🎭"}</span>
      <span className={meta?.color}>{mood}</span>
    </Badge>
  );
}

export function CategoryBadge({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={className}>
      {category}
    </Badge>
  );
}

export function TruthBadge({ truthType }: { truthType: Story["truth_type"] }) {
  const meta = TRUTH_TYPES.find((t) => t.value === truthType);
  return (
    <Badge variant="secondary" className="font-normal">
      {meta?.label ?? "Story"}
    </Badge>
  );
}

/** Renders the location string honoring the author's chosen visibility. */
export function StoryLocation({ story }: { story: Story }) {
  if (story.location_visibility === "none") return null;
  let label = "";
  switch (story.location_visibility) {
    case "city":
      label = [story.city, story.state].filter(Boolean).join(", ");
      break;
    case "state":
      label = story.state ?? "";
      break;
    case "region":
      label = "Somewhere nearby";
      break;
  }
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <MapPin className="h-3 w-3" />
      {label}
    </span>
  );
}

export function ContentWarning({ story }: { story: Story }) {
  if (!story.content_warning) return null;
  return (
    <Badge variant="warn" className="gap-1">
      <AlertTriangle className="h-3 w-3" />
      {story.content_warning_label ?? "Content warning"}
    </Badge>
  );
}
