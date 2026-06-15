"use client";

import { useId } from "react";
import { motion } from "framer-motion";

interface GrowthChartProps {
  data: number[];
  /** A CSS color (e.g. an hsl var or hex) used for the line + area gradient. */
  color?: string;
  className?: string;
}

const WIDTH = 600;
const HEIGHT = 180;
const PAD = 8;

/**
 * Self-contained animated line+area chart. No chart library — just an SVG path
 * built from the data, with the line drawn in via a Framer Motion path tween.
 */
export function GrowthChart({
  data,
  color = "hsl(var(--primary))",
  className,
}: GrowthChartProps) {
  const gradientId = useId();
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = Math.max(max - min, 1);

  // Map each point into the SVG coordinate space.
  const points = data.map((value, i) => {
    const x = PAD + (i / Math.max(data.length - 1, 1)) * (WIDTH - PAD * 2);
    const y =
      HEIGHT - PAD - ((value - min) / range) * (HEIGHT - PAD * 2);
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // Close the line down to the baseline for the filled area.
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${
    HEIGHT - PAD
  } L ${points[0].x.toFixed(1)} ${HEIGHT - PAD} Z`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className={className}
      role="img"
      aria-label="Weekly reads over time"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* faint horizontal gridlines */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={PAD}
          x2={WIDTH - PAD}
          y1={PAD + t * (HEIGHT - PAD * 2)}
          y2={PAD + t * (HEIGHT - PAD * 2)}
          stroke="hsl(var(--border))"
          strokeWidth={1}
          strokeDasharray="2 6"
          opacity={0.5}
        />
      ))}

      {/* filled area fades in under the line */}
      <motion.path
        d={areaPath}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />

      {/* animated line draw */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {/* endpoint dot */}
      <motion.circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={4}
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 400, damping: 16 }}
      />
    </svg>
  );
}
