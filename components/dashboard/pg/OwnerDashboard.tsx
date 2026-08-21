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
  LoaderCircle,
  Minus,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  COOLING_LABELS,
  PG_GENDER_LABELS,
  ROOM_TYPE_LABELS,
  type PgDetail,
} from "@/lib/api/pg";
import { usePgStore } from "@/stores/pg-store";
import { PgAmenitiesForm } from "./PgAmenitiesForm";
import { PgBasicsForm } from "./PgBasicsForm";
import { PgPhotosForm } from "./PgPhotosForm";
import { PgRoomsForm } from "./PgRoomsForm";

type EditorName = "basics" | "rooms" | "amenities" | "photos" | null;

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
    <article className="rounded-2xl border bg-background p-5">
      <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>
    </article>
  );
}

function SectionCard({
  title,
  summary,
  isDone,
  onEdit,
}: {
  title: string;
  summary: string;
  isDone: boolean;
  onEdit: () => void;
}) {
  return (
    <article className="flex items-start gap-4 rounded-2xl border bg-background p-5">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          isDone ? "bg-success/15 text-success" : "bg-accent text-accent-foreground"
        )}
      >
        {isDone ? (
          <Check className="size-4.5" strokeWidth={3} />
        ) : (
          <Pencil className="size-4" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base font-bold">{title}</h3>
        <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
          {summary}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onEdit}
        className="h-9 shrink-0 rounded-full px-4 text-[13px] font-semibold"
      >
        {isDone ? "Edit" : "Add"}
      </Button>
    </article>
  );
}

/** Inline stepper so the most frequent edit needs no dialog. */
function AvailabilityRow({ pg }: { pg: PgDetail }) {
  const setAvailability = usePgStore((state) => state.setAvailability);
  const [pending, setPending] = useState<string | null>(null);

  async function change(type: PgDetail["roomTypes"][number], delta: number) {
    const next = type.availableBeds + delta;
    if (next < 0 || next > type.totalBeds) return;

    setPending(type.type);

    try {
      await setAvailability(type.type, next);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not update.");
    } finally {
      setPending(null);
    }
  }

  return (
    <ul className="divide-y">
      {pg.roomTypes.map((room) => (
        <li
          key={room.type}
          className="flex flex-wrap items-center gap-4 py-3.5 first:pt-0 last:pb-0"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{ROOM_TYPE_LABELS[room.type]}</p>
            <p className="text-xs text-muted-foreground">
              {room.roomCount} room{room.roomCount === 1 ? "" : "s"} ·{" "}
              {room.totalBeds} bed{room.totalBeds === 1 ? "" : "s"} ·{" "}
              {rupees(room.pricePerBed)} per bed
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              aria-label={`One fewer free bed in ${ROOM_TYPE_LABELS[room.type]}`}
              disabled={pending !== null || room.availableBeds === 0}
              onClick={() => change(room, -1)}
              className="size-9 rounded-full p-0"
            >
              <Minus className="size-4" />
            </Button>

            <span className="w-24 text-center text-sm font-semibold tabular-nums">
              {pending === room.type ? (
                <LoaderCircle className="mx-auto size-4 animate-spin" />
              ) : (
                `${room.availableBeds} / ${room.totalBeds} free`
              )}
            </span>

            <Button
              type="button"
              variant="outline"
              aria-label={`One more free bed in ${ROOM_TYPE_LABELS[room.type]}`}
              disabled={
                pending !== null || room.availableBeds >= room.totalBeds
              }
              onClick={() => change(room, 1)}
              className="size-9 rounded-full p-0"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function OwnerDashboard() {
  const { pg, isLoading, hasNoPg, error, load } = usePgStore();
  const [editor, setEditor] = useState<EditorName>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void load();
  }, [load]);

  async function copyCode(pgCode: string) {
    try {
      await navigator.clipboard.writeText(pgCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Please copy the ID manually.");
    }
  }

  if (isLoading && !pg) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-32 rounded-[2rem]" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (hasNoPg) {
    return (
      <div className="rounded-[2rem] border border-dashed bg-card px-6 py-14 text-center">
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

  if (error && !pg) {
    return (
      <div className="rounded-[2rem] border border-destructive/30 bg-destructive/10 px-6 py-12 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void load()}
          className="mt-5 h-11 rounded-full px-6 font-semibold"
        >
          Try again
        </Button>
      </div>
    );
  }

  if (!pg) return null;

  const { totals, completion } = pg;
  const isComplete = completion.percent === 100;

  return (
    <div className="grid gap-5">
      {/* Identity */}
      <header className="rounded-[2rem] border bg-card p-6 shadow-[0_24px_64px_rgb(38_22_10/0.08)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-[0.16em] text-brand-ink uppercase">
              PG Owner
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {pg.name}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {pg.location}
              {pg.city ? `, ${pg.city}` : ""}
            </p>
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
              onClick={() => copyCode(pg.pgCode)}
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

        {/* Completion */}
        <div className="mt-7 rounded-2xl border bg-secondary/40 p-5">
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
            <p className="mt-3 text-xs text-muted-foreground">
              Still to add: {completion.missing.join(" · ")}
            </p>
          )}
        </div>
      </header>

      {/* Numbers */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={DoorOpen}
          label="Rooms"
          value={String(totals.rooms)}
          hint="Across every room type you offer."
        />
        <Stat
          icon={BedDouble}
          label="Beds free"
          value={`${totals.availableBeds} / ${totals.beds}`}
          hint={totals.isAvailable ? "Taking enquiries now." : "Currently full."}
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

      {/* Availability */}
      {pg.roomTypes.length > 0 && (
        <section className="rounded-[2rem] border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold">Availability</h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Keep free beds current — it is what residents filter on.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditor("rooms")}
              className="h-9 rounded-full px-4 text-[13px] font-semibold"
            >
              Edit rooms
            </Button>
          </div>

          <div className="mt-5">
            <AvailabilityRow pg={pg} />
          </div>
        </section>
      )}

      {/* Sections */}
      <section className="rounded-[2rem] border bg-card p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold">Your listing</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Each part saves on its own, so you can finish it whenever suits you.
        </p>

        <div className="mt-5 grid gap-3">
          <SectionCard
            title="Basics"
            isDone={Boolean(pg.description && pg.price !== null && pg.gender)}
            summary={
              pg.price !== null
                ? `${rupees(pg.price)} a month${pg.gender ? ` · ${PG_GENDER_LABELS[pg.gender]}` : ""}${pg.cooling ? ` · ${COOLING_LABELS[pg.cooling]}` : ""}`
                : "Rent, deposit, who it is for and a description."
            }
            onEdit={() => setEditor("basics")}
          />
          <SectionCard
            title="Rooms & pricing"
            isDone={pg.roomTypes.length > 0}
            summary={
              pg.roomTypes.length > 0
                ? pg.roomTypes
                    .map((room) => ROOM_TYPE_LABELS[room.type])
                    .join(" · ")
                : "Room types you offer, with counts and rent."
            }
            onEdit={() => setEditor("rooms")}
          />
          <SectionCard
            title="Amenities & food"
            isDone={pg.amenities.length > 0}
            summary={
              pg.amenities.length > 0
                ? `${pg.amenities.slice(0, 4).join(", ")}${pg.amenities.length > 4 ? ` +${pg.amenities.length - 4} more` : ""}`
                : "WiFi, laundry, parking and whether meals are included."
            }
            onEdit={() => setEditor("amenities")}
          />
          <SectionCard
            title="Photos"
            isDone={pg.images.length > 0}
            summary={
              pg.images.length > 0
                ? `${pg.images.length} photo${pg.images.length === 1 ? "" : "s"} added.`
                : "Show the rooms, common areas and entrance."
            }
            onEdit={() => setEditor("photos")}
          />
        </div>

        {pg.foodIncluded && (
          <p className="mt-4 flex items-center gap-2 text-[13px] text-muted-foreground">
            <UtensilsCrossed className="size-4" />
            Meals are included in the rent.
          </p>
        )}
      </section>

      {/* Editors are mounted per-open so each starts from the stored values. */}
      {editor === "basics" && (
        <PgBasicsForm pg={pg} open onOpenChange={() => setEditor(null)} />
      )}
      {editor === "rooms" && (
        <PgRoomsForm pg={pg} open onOpenChange={() => setEditor(null)} />
      )}
      {editor === "amenities" && (
        <PgAmenitiesForm pg={pg} open onOpenChange={() => setEditor(null)} />
      )}
      {editor === "photos" && (
        <PgPhotosForm pg={pg} open onOpenChange={() => setEditor(null)} />
      )}
    </div>
  );
}
