"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  BedDouble,
  Check,
  Copy,
  DoorOpen,
  ImageIcon,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ROOM_TYPE_LABELS, type PgDetail } from "@/lib/api/pg";
import { usePgStore } from "@/stores/pg-store";
import { PageHeader } from "../PageHeader";
import { PublishCard } from "./PublishCard";

const rupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;

function Stat({
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

/** Shared by every owner screen that needs the PG loaded. */
export function usePgOnce() {
  const load = usePgStore((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  return usePgStore();
}

export function PgLoadingState() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );
}

export function NoPgState() {
  return (
    <div className="rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
      <h2 className="font-display text-xl font-bold">No PG linked yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        This owner account was created before PG listings existed, so there is
        nothing to manage here. Register again as a PG owner to create one.
      </p>
      <Button
        render={<Link href="/register" />}
        className="mt-6 h-11 rounded-full px-6 font-semibold"
      >
        Register a PG
      </Button>
    </div>
  );
}

export function PgErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-12 text-center">
      <p className="text-sm font-medium text-destructive">{message}</p>
      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="mt-5 h-11 rounded-full px-6 font-semibold"
      >
        Try again
      </Button>
    </div>
  );
}

function PgIdentity({ pg }: { pg: PgDetail }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(pg.pgCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Please copy the ID manually.");
    }
  }

  // `location` usually already names the city, so only add it when it does not.
  const place =
    pg.city && !pg.location.toLowerCase().includes(pg.city.toLowerCase())
      ? `${pg.location}, ${pg.city}`
      : pg.location;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border bg-card p-6">
      <div className="min-w-0">
        <h2 className="font-display text-2xl font-extrabold tracking-tight">
          {pg.name}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{place}</p>
      </div>

      <div className="flex flex-col items-start gap-2.5 sm:items-end">
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold",
            pg.verified
              ? "bg-success/15 text-success"
              : "bg-secondary text-muted-foreground"
          )}
        >
          <ShieldCheck className="size-4" />
          {pg.verified ? "Verified" : "Pending review"}
        </span>

        <button
          type="button"
          onClick={copyCode}
          className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 font-display text-sm font-extrabold tracking-wider text-brand-ink transition-colors hover:bg-accent"
        >
          {pg.pgCode}
          {copied ? (
            <Check className="size-3.5 text-success" strokeWidth={3} />
          ) : (
            <Copy className="size-3.5" />
          )}
          <span className="sr-only">Copy PG ID</span>
        </button>
      </div>
    </div>
  );
}

export function OverviewSection() {
  const { pg, isLoading, hasNoPg, error, load } = usePgOnce();

  if (isLoading && !pg) return <PgLoadingState />;
  if (hasNoPg) return <NoPgState />;
  if (error && !pg) return <PgErrorState message={error} onRetry={() => void load(true)} />;
  if (!pg) return null;

  const { totals, completion } = pg;
  const isComplete = completion.percent === 100;
  const filledBeds = totals.beds - totals.availableBeds;

  return (
    <>
      <PageHeader
        title="Overview"
        description="Where your listing stands right now."
      />

      <div className="grid gap-5">
        <PgIdentity pg={pg} />

        {/* Whether residents can actually see this listing. */}
        <PublishCard />

        {/* Completion */}
        <section className="rounded-2xl border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-brand-ink" />
              {isComplete
                ? "Your listing is complete"
                : `Listing ${completion.percent}% complete`}
            </p>
            <p className="text-[13px] text-muted-foreground">
              {isComplete
                ? "Everything residents need is filled in."
                : `Next: ${completion.missing[0]}`}
            </p>
          </div>

          <div
            role="progressbar"
            aria-valuenow={completion.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Listing completion"
            className="mt-3 h-2 overflow-hidden rounded-full bg-border"
          >
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isComplete ? "bg-success" : "bg-primary"
              )}
              style={{ width: `${completion.percent}%` }}
            />
          </div>

          {!isComplete && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-xs text-muted-foreground">
                Still to add: {completion.missing.join(" · ")}
              </p>
              <Button
                render={<Link href="/pg-owner/pg-info" />}
                variant="outline"
                className="ml-auto h-9 rounded-full px-4 text-[13px] font-semibold"
              >
                Complete listing
              </Button>
            </div>
          )}
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            icon={DoorOpen}
            label="Rooms"
            value={String(totals.rooms)}
            hint="Across every room type."
          />
          <Stat
            icon={BedDouble}
            label="Beds free"
            value={`${totals.availableBeds} / ${totals.beds}`}
            hint={
              totals.isAvailable
                ? `${filledBeds} occupied right now.`
                : "Currently full."
            }
          />
          <Stat
            icon={Star}
            label="Rating"
            value={pg.reviewCount > 0 ? pg.rating.toFixed(1) : "—"}
            hint={
              pg.reviewCount > 0
                ? `From ${pg.reviewCount} resident${pg.reviewCount === 1 ? "" : "s"}.`
                : "No ratings yet."
            }
          />
          <Stat
            icon={ImageIcon}
            label="Photos"
            value={String(pg.images.length)}
            hint="Listings with photos get more enquiries."
          />
        </div>

        {/* Rooms summary */}
        <section className="rounded-2xl border bg-card p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold">Rooms</h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Free beds are what residents filter on.
              </p>
            </div>
            <Button
              render={<Link href="/pg-owner/rooms" />}
              variant="outline"
              className="h-9 rounded-full px-4 text-[13px] font-semibold"
            >
              Manage rooms
            </Button>
          </div>

          {pg.roomTypes.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No room types added yet.
            </p>
          ) : (
            <ul className="mt-5 divide-y">
              {pg.roomTypes.map((room) => (
                <li
                  key={room.type}
                  className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {ROOM_TYPE_LABELS[room.type]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {room.roomCount} room{room.roomCount === 1 ? "" : "s"} ·{" "}
                      {rupees(room.pricePerBed)} per bed
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {room.availableBeds} / {room.totalBeds} free
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
