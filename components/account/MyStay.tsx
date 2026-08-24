"use client";

import Link from "next/link";
import {
  BedDouble,
  CalendarClock,
  DoorOpen,
  LoaderCircle,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchStay } from "@/lib/api/account";
import { useCachedResource } from "@/stores/resource-cache";
import { PG_GENDER_LABELS, ROOM_TYPE_LABELS } from "@/lib/api/pg";

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Fixed to en-IN so a date reads the same for everyone looking at it. */
function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BedDouble;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-1.5 font-display text-lg font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}

export function MyStay() {
  // Cached, so coming back to this page shows the room straight away instead
  // of a spinner and another request.
  const {
    data: stay,
    isLoading,
    error,
  } = useCachedResource("me/stay", async () => (await fetchStay()).data);

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <LoaderCircle className="size-7 animate-spin text-brand-ink" />
        <span className="sr-only">Loading your stay</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  // The ordinary state for someone still looking, so it reads as an invitation
  // rather than as something having gone wrong.
  if (!stay) {
    return (
      <div className="max-w-xl rounded-3xl border bg-card p-8 text-center sm:p-12">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <DoorOpen className="size-7" />
        </span>
        <h2 className="mt-5 font-display text-xl font-bold text-foreground">
          You&apos;re not staying in a PG yet
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Once your PG owner adds you as a resident, your room, rent and due date
          will show up here automatically.
        </p>
        <Button
          render={<Link href="/pg" />}
          className="mt-6 h-12 gap-2 rounded-full px-7 text-base font-semibold"
        >
          <Search className="size-4.5" />
          Find a PG
        </Button>
      </div>
    );
  }

  const { pg } = stay;

  return (
    <div className="max-w-3xl">
      <div className="overflow-hidden rounded-3xl border bg-card">
        {pg.image && (
          // Remote Cloudinary URL, so a plain img avoids next/image host config.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pg.image}
            alt={pg.name}
            className="h-44 w-full object-cover sm:h-56"
          />
        )}

        <div className="flex flex-wrap items-start justify-between gap-4 p-6 sm:p-8">
          <div className="flex min-w-0 items-center gap-4">
            {pg.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pg.logo}
                alt=""
                className="size-14 shrink-0 rounded-2xl border object-cover"
              />
            )}
            <div className="min-w-0">
              <h2 className="truncate font-display text-2xl font-bold text-foreground">
                {pg.name}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                <span className="truncate">{pg.location}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {pg.verification === "VERIFIED" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
                <ShieldCheck className="size-3.5" />
                Verified
              </span>
            )}
            <span className="rounded-full bg-secondary px-3 py-1.5 font-mono text-xs font-semibold text-secondary-foreground">
              {pg.pgCode}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Fact
          icon={DoorOpen}
          label="Room"
          value={stay.roomNumber ?? "Not assigned"}
        />
        <Fact
          icon={BedDouble}
          label="Sharing"
          value={ROOM_TYPE_LABELS[stay.roomType]}
        />
        <Fact
          icon={CalendarClock}
          label="Next due"
          value={stay.dueDate ? formatDate(stay.dueDate) : "—"}
        />
        <Fact
          icon={Utensils}
          label="Food"
          value={pg.foodIncluded ? "Included" : "Not included"}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border bg-card p-6 sm:p-8">
          <h3 className="font-display text-lg font-bold text-foreground">
            What you pay
          </h3>

          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Rent</dt>
              <dd className="font-semibold text-foreground">
                {rupees.format(stay.monthlyRent)}
              </dd>
            </div>

            {stay.services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between gap-4"
              >
                <dt className="text-muted-foreground">{service.name}</dt>
                <dd className="font-semibold text-foreground">
                  {rupees.format(service.monthlyAmount)}
                </dd>
              </div>
            ))}

            <div className="flex items-center justify-between gap-4 border-t pt-3">
              <dt className="font-semibold text-foreground">Every month</dt>
              <dd className="font-display text-xl font-bold text-brand-ink">
                {rupees.format(stay.monthlyTotal)}
              </dd>
            </div>
          </dl>

          {stay.services.length === 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              No extra services on your room.
            </p>
          )}
        </div>

        <div className="rounded-3xl border bg-card p-6 sm:p-8">
          <h3 className="font-display text-lg font-bold text-foreground">
            Your PG owner
          </h3>
          <p className="mt-4 text-sm font-semibold text-foreground">
            {pg.ownerName}
          </p>
          <p className="text-sm text-muted-foreground">
            {pg.gender ? PG_GENDER_LABELS[pg.gender] : "PG"}
            {pg.city ? ` · ${pg.city}` : ""}
          </p>

          <Button
            variant="outline"
            render={<a href={`tel:${pg.ownerPhone}`} />}
            className="mt-5 h-11 w-full gap-2 rounded-full text-sm font-semibold"
          >
            <Phone className="size-4" />
            {pg.ownerPhone}
          </Button>

          <p className="mt-4 text-xs text-muted-foreground">
            Staying since {formatDate(stay.joinedAt)}.
          </p>
        </div>
      </div>
    </div>
  );
}
