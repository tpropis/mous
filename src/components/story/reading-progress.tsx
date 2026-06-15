"use client";

import { useEffect, useRef, useState } from "react";

interface ReadingProgressProps {
  /** Selector for the article element whose scroll we track. */
  targetId: string;
}

/**
 * Thin fixed progress bar that fills as the reader scrolls through the article.
 * Uses a single scroll/resize listener throttled via requestAnimationFrame.
 */
export function ReadingProgress({ targetId }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    function compute() {
      const el = document.getElementById(targetId);
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      // Distance scrolled past the top of the article, clamped to its length.
      const scrolled = Math.min(Math.max(-top, 0), Math.max(height - viewport, 1));
      const total = Math.max(height - viewport, 1);
      setProgress(Math.min(100, (scrolled / total) * 100));
    }

    function onScroll() {
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        compute();
      });
    }

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [targetId]);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent">
      <div
        className="h-full origin-left bg-gradient-to-r from-neon-violet to-neon-rose transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
        aria-hidden
      />
    </div>
  );
}
