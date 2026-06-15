"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { hashToIndex } from "@/lib/utils";

/**
 * Abstract, deterministic avatar.
 * Renders a gradient "sigil" derived purely from a seed string — never a face,
 * never anything personal. The same seed always produces the same mark, so a
 * writer is visually recognizable while staying fully anonymous.
 */

const GRADIENTS = [
  ["#7c3aed", "#ec4899"],
  ["#2563eb", "#06b6d4"],
  ["#f59e0b", "#ef4444"],
  ["#10b981", "#3b82f6"],
  ["#8b5cf6", "#22d3ee"],
  ["#f43f5e", "#f59e0b"],
  ["#14b8a6", "#8b5cf6"],
  ["#6366f1", "#ec4899"],
];

interface AnonAvatarProps {
  seed: string;
  name?: string;
  size?: number;
  className?: string;
}

export function AnonAvatar({ seed, name, size = 40, className }: AnonAvatarProps) {
  const { gradient, shapes } = useMemo(() => {
    const gi = hashToIndex(seed, GRADIENTS.length);
    const gradient = GRADIENTS[gi];
    // Generate a few deterministic blobs / lines for visual interest.
    const shapes = Array.from({ length: 3 }, (_, i) => {
      const h = hashToIndex(`${seed}-${i}`, 1000);
      return {
        cx: 20 + (h % 60),
        cy: 20 + ((h * 7) % 60),
        r: 10 + (h % 22),
        o: 0.25 + ((h % 40) / 100),
      };
    });
    return { gradient, shapes };
  }, [seed]);

  const gradId = `g-${seed}`;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full ring-1 ring-white/10",
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={name ? `${name} avatar` : "anonymous avatar"}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#${gradId})`} />
        {shapes.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="white"
            opacity={s.o * 0.4}
          />
        ))}
        <circle cx="50" cy="50" r="50" fill="black" opacity="0.05" />
      </svg>
    </div>
  );
}
