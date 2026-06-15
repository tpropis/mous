"use client";

import { useEffect, useMemo, useState } from "react";
import { Compass } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { SectionHeading } from "@/components/common/section-heading";
import { StoryCard } from "@/components/story/story-card";
import { MISSIONS, getStories } from "@/lib/data";
import type { Mission } from "@/lib/types";
import { MissionCard } from "./mission-card";

const STORAGE_KEY = "mous:missions";

/** Shape persisted to localStorage so progress survives reloads. */
interface MissionProgress {
  accepted: string[];
  completed: string[];
}

/**
 * The interactive missions board. Accepted/completed state lives here (and in
 * localStorage) so the tabs can filter, and is passed down to each card.
 */
export function MissionsBoard() {
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // Load persisted progress once on mount (client-only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MissionProgress;
        setAccepted(new Set(parsed.accepted ?? []));
        setCompleted(new Set(parsed.completed ?? []));
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  // Persist on change (after hydration to avoid clobbering stored state).
  useEffect(() => {
    if (!hydrated) return;
    const payload: MissionProgress = {
      accepted: [...accepted],
      completed: [...completed],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [accepted, completed, hydrated]);

  function handleAccept(id: string) {
    setAccepted((prev) => new Set(prev).add(id));
  }

  function handleComplete(id: string) {
    setCompleted((prev) => new Set(prev).add(id));
    setAccepted((prev) => new Set(prev).add(id)); // completing implies accepted
  }

  const acceptedMissions = useMemo(
    () => MISSIONS.filter((m) => accepted.has(m.id)),
    [accepted],
  );
  const completedMissions = useMemo(
    () => MISSIONS.filter((m) => completed.has(m.id)),
    [completed],
  );

  // In production these would be `getStories({ missionOnly: true })`, filtered by
  // mission_id. The mock stories don't carry mission_id yet, so we surface a
  // curated rail of the top stories as a stand-in.
  const missionStories = useMemo(() => getStories().slice(0, 5), []);

  function renderGrid(list: Mission[], emptyHint: string) {
    if (list.length === 0) {
      return (
        <EmptyState
          icon={Compass}
          title="Nothing here yet"
          description={emptyHint}
        />
      );
    }
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((m, i) => (
          <MissionCard
            key={m.id}
            mission={m}
            index={i}
            accepted={accepted.has(m.id)}
            completed={completed.has(m.id)}
            onAccept={handleAccept}
            onComplete={handleComplete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <Tabs defaultValue="all">
        <div className="flex flex-wrap items-center gap-3">
          <TabsList>
            <TabsTrigger value="all">All missions</TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted
              {acceptedMissions.length > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5">
                  {acceptedMissions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              {completedMissions.length > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5">
                  {completedMissions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all">{renderGrid(MISSIONS, "")}</TabsContent>
        <TabsContent value="accepted">
          {renderGrid(
            acceptedMissions,
            "Accept a mission above and it will show up here, waiting to become a story.",
          )}
        </TabsContent>
        <TabsContent value="completed">
          {renderGrid(
            completedMissions,
            "Finish a mission and mark it complete to collect it here.",
          )}
        </TabsContent>
      </Tabs>

      {/* Stories that began as missions — a curated rail. */}
      <section>
        <SectionHeading
          eyebrow="Proof it works"
          title="Stories that started as missions"
          description="People accepted a mission, went out, and came back with these."
          href="/feed"
          hrefLabel="Read more"
        />
        <div className="mt-6 grid gap-1 rounded-2xl border border-border bg-card/40 p-3 sm:grid-cols-2 lg:grid-cols-3">
          {missionStories.map((story, i) => (
            <StoryCard key={story.id} story={story} index={i} variant="compact" />
          ))}
        </div>
      </section>
    </div>
  );
}
