"use client";

import { useEffect } from "react";
import {
  BedDouble,
  CalendarCheck,
  Info,
  Timer,
  TrendingUp,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ROOM_TYPE_LABELS } from "@/lib/api/pg";
import { useAnalyticsStore } from "@/stores/analytics-store";
import { PageHeader } from "../PageHeader";
import { NoPgState, PgErrorState } from "./OverviewSection";

const rupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;

/** "2026-08" → "Aug", without letting a timezone shift the month. */
function monthLabel(month: string): string {
  const [year, index] = month.split("-").map(Number);
  return new Date(year, index - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
  });
}

function Tile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof BedDouble;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="rounded-2xl border bg-card p-5">
      <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>
    </article>
  );
}

export function AnalyticsSection() {
  const { data, isLoading, hasNoPg, error, load } = useAnalyticsStore();

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading && !data) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (hasNoPg) return <NoPgState />;
  if (error && !data) return <PgErrorState message={error} onRetry={() => void load(true)} />;
  if (!data) return null;

  const peakCollected = Math.max(
    ...data.monthly.map((point) => point.collected),
    1
  );

  return (
    <>
      <PageHeader
        title="Analytics"
        description="How your PG is performing, from the guests and payments you have recorded."
      />

      <div className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile
            icon={BedDouble}
            label="Occupancy"
            value={`${data.occupancyRate}%`}
            hint={`${data.occupiedBeds} of ${data.totalBeds} beds taken.`}
          />
          <Tile
            icon={Timer}
            label="Average stay"
            value={
              data.averageStayMonths === null
                ? "—"
                : `${data.averageStayMonths} mo`
            }
            hint={
              data.pastGuests === 0
                ? "Nobody has moved out yet."
                : `From ${data.pastGuests} past guest${data.pastGuests === 1 ? "" : "s"}.`
            }
          />
          <Tile
            icon={CalendarCheck}
            label="Visit requests"
            value={String(data.visitsTotal)}
            hint={
              data.visitsTotal === 0
                ? "No requests from the website yet."
                : `${data.visitsCompleted} visited · ${data.visitConversion}% converted.`
            }
          />
          <Tile
            icon={UserPlus}
            label="Guests"
            value={String(data.activeGuests)}
            hint={`${data.pastGuests} moved on since you started.`}
          />
        </div>

        {/* Occupancy trend */}
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Occupancy by month</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Beds taken at the end of each month.
          </p>

          <ul className="mt-6 flex items-end gap-3 sm:gap-5">
            {data.monthly.map((point) => (
              <li
                key={point.month}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {point.occupancyRate}%
                </span>
                <div
                  role="img"
                  aria-label={`${monthLabel(point.month)}: ${point.occupiedBeds} of ${data.totalBeds} beds`}
                  style={{
                    height: `${Math.max(4, (point.occupancyRate / 100) * 120)}px`,
                  }}
                  className={cn(
                    "w-full rounded-t-lg transition-all",
                    point.occupancyRate > 0 ? "bg-primary" : "bg-border"
                  )}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {monthLabel(point.month)}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-5 flex gap-2 rounded-xl bg-secondary/50 p-3.5 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            {data.occupancyCaveat}
          </p>
        </section>

        {/* Earnings trend */}
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Collected by month</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Rent recorded against each month.
          </p>

          <ul className="mt-6 flex items-end gap-3 sm:gap-5">
            {data.monthly.map((point) => (
              <li
                key={point.month}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {point.collected > 0
                    ? `₹${(point.collected / 1000).toFixed(point.collected >= 10000 ? 0 : 1)}k`
                    : "—"}
                </span>
                <div
                  role="img"
                  aria-label={`${monthLabel(point.month)}: ${rupees(point.collected)}`}
                  style={{
                    height: `${Math.max(4, (point.collected / peakCollected) * 120)}px`,
                  }}
                  className={cn(
                    "w-full rounded-t-lg transition-all",
                    point.collected > 0 ? "bg-success" : "bg-border"
                  )}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {monthLabel(point.month)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Movement */}
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-lg font-bold">
            Moving in and out
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            How many guests arrived and left each month.
          </p>

          <ul className="mt-5 divide-y">
            {data.monthly.map((point) => (
              <li
                key={point.month}
                className="flex items-center gap-4 py-2.5 first:pt-0 last:pb-0"
              >
                <span className="w-12 text-sm font-semibold">
                  {monthLabel(point.month)}
                </span>
                <span className="flex items-center gap-1.5 text-[13px] text-success">
                  <UserPlus className="size-3.5" />
                  {point.joined} in
                </span>
                <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <UserMinus className="size-3.5" />
                  {point.left} out
                </span>
                <span className="ml-auto flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <CalendarCheck className="size-3.5" />
                  {point.visits} visit{point.visits === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Per room type */}
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-lg font-bold">By room type</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Which sharing types are filling, and what each brings in.
          </p>

          {data.byRoomType.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No rooms added yet.
            </p>
          ) : (
            <ul className="mt-5 grid gap-3">
              {data.byRoomType.map((room) => (
                <li key={room.type} className="rounded-xl border bg-background p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold">
                      {ROOM_TYPE_LABELS[room.type]}
                    </p>
                    <span className="text-[13px] text-muted-foreground">
                      {room.occupiedBeds} / {room.totalBeds} beds
                    </span>
                    <span className="ml-auto flex items-center gap-1.5 text-sm font-semibold tabular-nums">
                      <TrendingUp className="size-4 text-muted-foreground" />
                      {rupees(room.monthlyRevenue)}
                      <span className="text-xs font-normal text-muted-foreground">
                        /mo
                      </span>
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-valuenow={room.occupancyRate}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${ROOM_TYPE_LABELS[room.type]} occupancy`}
                    className="mt-3 h-2 overflow-hidden rounded-full bg-border"
                  >
                    <div
                      style={{ width: `${room.occupancyRate}%` }}
                      className={cn(
                        "h-full rounded-full transition-all",
                        room.occupancyRate >= 80
                          ? "bg-success"
                          : room.occupancyRate > 0
                            ? "bg-primary"
                            : "bg-border"
                      )}
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {room.occupancyRate}% full
                    {room.occupancyRate === 0 ? " — nobody staying yet" : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="flex gap-2 rounded-xl border bg-card p-4 text-[13px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          Everything here comes from your own records — guests, payments and
          visit requests. Website visits and search impressions are not shown,
          because nothing tracks them yet.
        </p>
      </div>
    </>
  );
}
