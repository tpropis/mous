"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCircle2, Compass, PenLine, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
// Server actions for the live write path (fire-and-forget alongside the optimistic UI).
import { acceptMission, completeMission } from "@/lib/actions";
import { getBadge } from "@/lib/badges";
import { DIFFICULTY_META } from "@/lib/constants";
import type { Mission } from "@/lib/types";
import { cn, formatCompact } from "@/lib/utils";

interface MissionCardProps {
  mission: Mission;
  index?: number;
  accepted: boolean;
  completed: boolean;
  onAccept: (id: string) => void;
  onComplete: (id: string) => void;
}

/**
 * A single Story Mission. Accepting plays a tactile check-swap animation, then
 * reveals the "write" + "complete" actions. State is lifted to the board so the
 * Accepted/Completed tabs can filter on it.
 */
export function MissionCard({
  mission,
  index = 0,
  accepted,
  completed,
  onAccept,
  onComplete,
}: MissionCardProps) {
  const { toast } = useToast();
  const [justAccepted, setJustAccepted] = useState(false);
  const difficulty = DIFFICULTY_META[mission.difficulty];
  const rewardBadge = mission.reward_badge ? getBadge(mission.reward_badge) : undefined;

  function handleAccept() {
    // Optimistic UI first, then persist via the server action (fire-and-forget).
    onAccept(mission.id);
    setJustAccepted(true);
    toast({
      title: "Mission accepted",
      description: `“${mission.title}” — now go live it.`,
      variant: "success",
    });
    void acceptMission(mission.id).then((result) => {
      if (!result.ok) {
        toast({ title: "Couldn't accept mission", description: result.error, variant: "error" });
      }
    });
  }

  function handleComplete() {
    onComplete(mission.id);
    toast({
      title: "Mission complete",
      description: rewardBadge
        ? `You earned the ${rewardBadge.name} badge.`
        : "You went out there. Proud of you.",
      variant: "success",
    });
    void completeMission(mission.id).then((result) => {
      if (!result.ok) {
        toast({ title: "Couldn't complete mission", description: result.error, variant: "error" });
      }
    });
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="group relative h-full"
    >
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300",
          "group-hover:border-primary/40 group-hover:shadow-2xl group-hover:shadow-primary/10",
          completed && "border-neon-teal/40",
        )}
      >
        {/* ambient hover glow */}
        <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:bg-gradient-to-br group-hover:from-neon-violet/10 group-hover:to-neon-rose/10" />

        <div className="relative flex flex-1 flex-col">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="glass" className={cn("font-semibold", difficulty.color)}>
              {difficulty.label}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              {mission.category}
            </Badge>
            {completed && (
              <Badge variant="glass" className="text-neon-teal">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed
              </Badge>
            )}
          </div>

          <h3 className="text-xl font-bold leading-tight tracking-tight transition-colors group-hover:text-primary">
            {mission.title}
          </h3>

          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {mission.description}
          </p>

          {/* the writing prompt to come back with */}
          <p className="mt-3 border-l-2 border-primary/40 pl-3 text-sm italic text-foreground/80">
            “{mission.prompt}”
          </p>

          {rewardBadge && (
            <div className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Reward: {rewardBadge.name}
            </div>
          )}

          {/* counts */}
          <div className="mt-4 flex items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {formatCompact(mission.accepted_count)} accepted
            </span>
            <span className="inline-flex items-center gap-1">
              <Compass className="h-3.5 w-3.5" />
              {formatCompact(mission.completed_count)} completed
            </span>
          </div>

          {/* actions */}
          <div className="mt-4 flex flex-col gap-2">
            {!accepted ? (
              <Button variant="brand" className="w-full" onClick={handleAccept}>
                {/* swap pen -> check on accept for a satisfying confirmation */}
                <AnimatePresence mode="wait" initial={false}>
                  {justAccepted ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 18 }}
                      className="inline-flex"
                    >
                      <Check className="h-5 w-5" />
                    </motion.span>
                  ) : (
                    <motion.span key="pen" exit={{ scale: 0 }} className="inline-flex">
                      <Compass className="h-5 w-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
                Accept mission
              </Button>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-neon-teal/10 px-3 py-2 text-sm font-semibold text-neon-teal"
                >
                  <Check className="h-4 w-4" />
                  Accepted
                </motion.div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild variant="glass" className="flex-1">
                    <Link href={`/write?mission=${mission.id}`}>
                      <PenLine className="h-4 w-4" />
                      Write the story
                    </Link>
                  </Button>
                  {!completed && (
                    <Button variant="outline" className="flex-1" onClick={handleComplete}>
                      <CheckCircle2 className="h-4 w-4" />
                      Mark complete
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
