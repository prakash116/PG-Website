"use client";

import { useState } from "react";
import type { SignupPoint } from "@/lib/api/users";
import { cn } from "@/lib/utils";

/** The drawing area, in SVG units. The chart scales to its container. */
const WIDTH = 720;
const HEIGHT = 220;
const PADDING = { top: 16, right: 8, bottom: 24, left: 8 };

function formatDay(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

interface SignupsChartProps {
  series: SignupPoint[];
  className?: string;
}

/**
 * Total accounts over time, drawn as a filled area with a hover readout — the
 * shape a market chart uses, because the question is the same: which way is
 * the line going.
 *
 * Inline SVG rather than a charting library: this site is a static export, one
 * chart does not justify a dependency, and the maths here is a few lines.
 */
export function SignupsChart({ series, className }: SignupsChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (series.length < 2) {
    return (
      <div
        className={cn(
          "flex h-56 items-center justify-center rounded-2xl border border-dashed bg-card text-sm text-muted-foreground",
          className,
        )}
      >
        Not enough days in this range to draw a line.
      </div>
    );
  }

  const totals = series.map((point) => point.total);
  const max = Math.max(...totals);
  const min = Math.min(...totals);
  // A flat line would divide by zero, and belongs in the middle of the box.
  const span = max - min || 1;

  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const xOf = (index: number) =>
    PADDING.left + (index / (series.length - 1)) * innerWidth;
  const yOf = (value: number) =>
    PADDING.top + innerHeight - ((value - min) / span) * innerHeight;

  const line = series
    .map((point, index) => `${xOf(index)},${yOf(point.total)}`)
    .join(" ");

  const area = `${PADDING.left},${PADDING.top + innerHeight} ${line} ${
    PADDING.left + innerWidth
  },${PADDING.top + innerHeight}`;

  const active = hovered === null ? series[series.length - 1] : series[hovered];
  const activeIndex = hovered ?? series.length - 1;
  const first = series[0].total;
  const change = active.total - first;

  return (
    <div className={cn("rounded-2xl border bg-card p-5", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {formatDay(active.date)}
          </p>
          <p className="font-display text-3xl font-bold text-foreground">
            {active.total}
            <span className="ml-2 align-middle text-sm font-semibold text-muted-foreground">
              accounts
            </span>
          </p>
        </div>

        <div className="text-right">
          <p
            className={cn(
              "font-display text-lg font-bold",
              change > 0 ? "text-success" : "text-muted-foreground",
            )}
          >
            {change > 0 ? "+" : ""}
            {change}
          </p>
          <p className="text-xs text-muted-foreground">over this range</p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-4 w-full"
        role="img"
        aria-label={`Accounts on the platform from ${formatDay(series[0].date)} to ${formatDay(series[series.length - 1].date)}, ending at ${series[series.length - 1].total}.`}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="signups-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Three faint guides, so a value can be read off without a full grid. */}
        {[0, 0.5, 1].map((step) => (
          <line
            key={step}
            x1={PADDING.left}
            x2={PADDING.left + innerWidth}
            y1={PADDING.top + innerHeight * step}
            y2={PADDING.top + innerHeight * step}
            stroke="currentColor"
            strokeWidth={1}
            className="text-border"
          />
        ))}

        <polygon points={area} fill="url(#signups-fill)" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <line
          x1={xOf(activeIndex)}
          x2={xOf(activeIndex)}
          y1={PADDING.top}
          y2={PADDING.top + innerHeight}
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="3 3"
          className="text-muted-foreground/50"
        />
        <circle
          cx={xOf(activeIndex)}
          cy={yOf(active.total)}
          r={5}
          fill="var(--brand)"
          stroke="var(--card)"
          strokeWidth={2.5}
        />

        {/* Invisible hit areas: one per day, so hovering never misses. */}
        {series.map((point, index) => (
          <rect
            key={point.date}
            x={xOf(index) - innerWidth / series.length / 2}
            y={PADDING.top}
            width={innerWidth / series.length}
            height={innerHeight}
            fill="transparent"
            onMouseEnter={() => setHovered(index)}
          />
        ))}
      </svg>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatDay(series[0].date)}</span>
        <span>{formatDay(series[series.length - 1].date)}</span>
      </div>
    </div>
  );
}
