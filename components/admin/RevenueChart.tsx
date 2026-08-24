"use client";

import { useState } from "react";
import type { RevenuePoint } from "@/lib/api/admin-pg";
import { cn } from "@/lib/utils";

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
  });
}

function fullMonthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

interface RevenueChartProps {
  points: RevenuePoint[];
  className?: string;
}

/**
 * Rent collected per month, as bars.
 *
 * Deliberately a different shape from the sign-ups area chart: that one is a
 * running total where the trend is the point, this one is twelve separate
 * months where the comparison is. Same colours, different question.
 */
export function RevenueChart({ points, className }: RevenueChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const max = Math.max(...points.map((point) => point.amount), 1);
  const total = points.reduce((sum, point) => sum + point.amount, 0);
  const active = hovered === null ? null : points[hovered];

  return (
    <div className={cn("rounded-2xl border bg-card p-5", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {active ? fullMonthLabel(active.month) : "Last 12 months"}
          </p>
          <p className="font-display text-2xl font-bold text-foreground">
            {rupees.format(active ? active.amount : total)}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {active ? "collected that month" : "collected in total"}
        </p>
      </div>

      <div
        className="mt-5 flex h-40 items-end gap-1.5"
        onMouseLeave={() => setHovered(null)}
      >
        {points.map((point, index) => {
          // A month with nothing still gets a sliver, so the row of months
          // stays readable rather than showing gaps where bars should be.
          const height = point.amount === 0 ? 2 : (point.amount / max) * 100;

          return (
            <button
              key={point.month}
              type="button"
              onMouseEnter={() => setHovered(index)}
              onFocus={() => setHovered(index)}
              aria-label={`${fullMonthLabel(point.month)}: ${rupees.format(point.amount)}`}
              className="group flex h-full flex-1 flex-col justify-end"
            >
              <span
                style={{ height: `${height}%` }}
                className={cn(
                  "w-full rounded-t-md transition-colors",
                  point.amount === 0
                    ? "bg-border"
                    : hovered === index
                      ? "bg-brand-ink"
                      : "bg-primary/70 group-hover:bg-brand-ink",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex gap-1.5">
        {points.map((point) => (
          <span
            key={point.month}
            className="flex-1 text-center text-[0.625rem] text-muted-foreground"
          >
            {monthLabel(point.month)}
          </span>
        ))}
      </div>
    </div>
  );
}
