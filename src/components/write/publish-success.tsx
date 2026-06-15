"use client";

import * as React from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { BookOpen, PartyPopper, PenLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface PublishSuccessProps {
  open: boolean;
  /** Title of the story that just went live — echoed back for a personal touch. */
  storyTitle: string;
  /** True when this is the author's very first published story (mock detection). */
  firstStory: boolean;
  onWriteAnother: () => void;
}

/** Brand-tinted confetti colors so the burst stays on-theme. */
const CONFETTI_COLORS = ["#a78bfa", "#f472b6", "#38bdf8", "#fbbf24", "#2dd4bf"];

/**
 * Celebratory publish state. Fires a tasteful two-origin confetti burst once the
 * dialog opens, then renders a centered success card with onward CTAs.
 */
export function PublishSuccess({
  open,
  storyTitle,
  firstStory,
  onWriteAnother,
}: PublishSuccessProps) {
  React.useEffect(() => {
    if (!open) return;
    // Fire from the two lower corners so the burst arcs toward the center —
    // gentler and more "premium" than a single dead-center explosion.
    const fire = () => {
      const base = { particleCount: 70, spread: 70, colors: CONFETTI_COLORS };
      confetti({ ...base, angle: 60, origin: { x: 0, y: 0.7 } });
      confetti({ ...base, angle: 120, origin: { x: 1, y: 0.7 } });
    };
    fire();
    // a soft second wave for a little extra lift
    const timer = window.setTimeout(fire, 240);
    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <Dialog open={open}>
      <DialogContent className="text-center sm:max-w-md [&>button]:hidden">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-neon-violet via-primary to-neon-rose text-white shadow-lg shadow-primary/40"
        >
          <PartyPopper className="h-7 w-7" />
        </motion.div>

        <DialogTitle className="mt-4 text-2xl">
          {firstStory ? "Your first story is live." : "Your story is live."}
        </DialogTitle>

        <DialogDescription className="mx-auto mt-1 max-w-sm text-base">
          {firstStory ? (
            <>
              You said the thing. “{storyTitle}” is out in the world now — no name
              attached, just the truth. The reads and reactions start now.
            </>
          ) : (
            <>“{storyTitle}” is published and anonymous. Onward to the next one.</>
          )}
        </DialogDescription>

        {firstStory && (
          <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-neon-violet/30 bg-neon-violet/10 px-3 py-1 text-xs font-medium text-neon-violet">
            <Sparkles className="h-3.5 w-3.5" />
            Storyteller unlocked
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="brand" size="lg">
            <Link href="/feed">
              <BookOpen className="h-5 w-5" />
              See it in the feed
            </Link>
          </Button>
          <Button
            type="button"
            variant="glass"
            size="lg"
            onClick={onWriteAnother}
          >
            <PenLine className="h-5 w-5" />
            Write another
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
