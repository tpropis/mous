import type { Metadata } from "next";
import { Compass, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/common/reveal";
import { MissionsBoard } from "@/components/missions/missions-board";
import { getStories } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Story Missions — MOUS",
  description:
    "Accept a mission, go live something worth writing, then come back and tell it anonymously.",
};

/**
 * Story Missions — the "Get Out There" engine. A server shell with a cinematic
 * hero over the interactive client board.
 */
export default async function MissionsPage() {
  // Live read on the server; the first few feed the "started as missions" rail.
  const stories = (await getStories()).slice(0, 5);

  return (
    <div className="relative">
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-faint bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] opacity-30" />
          <div className="absolute left-1/2 top-[-20%] h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-neon-violet/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[10%] h-[280px] w-[280px] rounded-full bg-neon-rose/15 blur-[120px]" />
        </div>

        <div className="container py-20 sm:py-28">
          <Reveal>
            <Badge variant="glass" className="mb-6 px-4 py-1.5 text-xs">
              <Compass className="h-3.5 w-3.5 text-neon-violet" />
              Get Out There
            </Badge>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="max-w-3xl text-balance text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
              Go live something
              <span className="text-gradient-brand"> worth writing.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
              Accept a mission. Come back with a story. The best writing rarely
              happens at a desk — it happens out there, in the moment you almost
              didn&apos;t have.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-neon-amber" /> Accept it
              </span>
              <span className="inline-flex items-center gap-2">
                <Compass className="h-4 w-4 text-neon-teal" /> Go do it
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-neon-rose" /> Write it anonymously
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------------- Board */}
      <section className="container py-14">
        <MissionsBoard stories={stories} />
      </section>
    </div>
  );
}
