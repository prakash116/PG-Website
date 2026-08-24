"use client";

import {
  ArrowLeft,
  BedDouble,
  Building2,
  DoorOpen,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { Button } from "@/components/ui/button";
import { fetchAdminPg } from "@/lib/api/admin-pg";
import { ROOM_TYPE_LABELS } from "@/lib/api/pg";
import { useCachedResource } from "@/stores/resource-cache";
import { cn } from "@/lib/utils";

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-1.5 font-display text-xl font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}

interface PgDetailPanelProps {
  pgCode: string;
  onBack: () => void;
}

/**
 * One PG in full: what the owner sees under Room management and CRM, read-only.
 *
 * Shown in place rather than on its own route. This site is a static export, so
 * a dynamic route would have to know every PG code at build time — which it
 * cannot.
 */
export function PgDetailPanel({ pgCode, onBack }: PgDetailPanelProps) {
  const { data: pg, error } = useCachedResource(
    `admin/pg:${pgCode}`,
    async () => (await fetchAdminPg(pgCode)).data,
  );

  const back = (
    <Button
      variant="outline"
      onClick={onBack}
      className="h-10 gap-2 rounded-full font-semibold"
    >
      <ArrowLeft className="size-4" />
      All PGs
    </Button>
  );

  if (error) {
    return (
      <div className="grid gap-4">
        {back}
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm font-medium text-destructive">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!pg) {
    return (
      <div className="grid gap-4">
        {back}
        <div className="flex min-h-60 items-center justify-center rounded-3xl border bg-card">
          <LoaderCircle className="size-6 animate-spin text-brand-ink" />
          <span className="sr-only">Loading this PG</span>
        </div>
      </div>
    );
  }

  const occupiedBeds = pg.beds - pg.availableBeds;

  return (
    <div className="grid gap-4">
      {back}

      <div className="rounded-3xl border bg-gradient-to-b from-accent to-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            {pg.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pg.logo}
                alt=""
                className="size-14 shrink-0 rounded-2xl border bg-card object-cover"
              />
            ) : (
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border bg-card text-brand-ink">
                <Building2 className="size-6" />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="truncate font-display text-2xl font-bold text-foreground">
                {pg.name}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                <span className="truncate">{pg.address}</span>
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
            <span
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                pg.isPublished
                  ? "bg-card text-foreground"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {pg.isPublished ? "Live" : "Hidden"}
            </span>
            <span className="rounded-full bg-card px-3 py-1.5 font-mono text-xs font-semibold text-foreground">
              {pg.pgCode}
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={`tel:${pg.ownerPhone}`}
            className="inline-flex h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-brand-ink"
          >
            <Phone className="size-4" />
            {pg.ownerName} · {pg.ownerPhone}
          </a>
          <a
            href={`mailto:${pg.ownerEmail}`}
            className="inline-flex h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-brand-ink"
          >
            <Mail className="size-4" />
            {pg.ownerEmail}
          </a>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={DoorOpen} label="Rooms" value={String(pg.rooms)} />
        <Stat
          icon={BedDouble}
          label="Beds"
          value={`${occupiedBeds} / ${pg.beds} full`}
        />
        <Stat icon={Users} label="Residents" value={String(pg.residents)} />
        <Stat
          icon={Building2}
          label="Membership"
          value={
            pg.membership === "PAID"
              ? `Paid ${pg.membershipPaidAt ? formatDate(pg.membershipPaidAt) : ""}`
              : pg.membership === "PENDING"
                ? "Due"
                : "Not started"
          }
        />
      </div>

      <RevenueChart points={pg.revenueByMonth} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border bg-card">
          <div className="border-b p-5">
            <h3 className="font-display text-lg font-bold text-foreground">
              Room management
            </h3>
            <p className="text-sm text-muted-foreground">
              {pg.roomTypes.length === 0
                ? "No room types set up yet."
                : `${pg.roomTypes.length} sharing type${pg.roomTypes.length === 1 ? "" : "s"}`}
            </p>
          </div>

          {pg.roomTypes.length > 0 && (
            <ul className="divide-y">
              {pg.roomTypes.map((type) => (
                <li
                  key={type.type}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {ROOM_TYPE_LABELS[type.type]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {type.rooms} room{type.rooms === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {rupees.format(type.pricePerBed)}
                    <span className="text-xs font-medium text-muted-foreground">
                      {" "}
                      / bed
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}

          {pg.roomList.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t p-5">
              {pg.roomList.map((room) => {
                const full = room.occupiedBeds >= room.totalBeds;

                return (
                  <span
                    key={room.number}
                    title={`${ROOM_TYPE_LABELS[room.type]} · ${room.occupiedBeds} of ${room.totalBeds} beds taken`}
                    className={cn(
                      "rounded-lg border px-2.5 py-1.5 font-mono text-xs font-semibold",
                      full
                        ? "border-destructive/30 bg-destructive/5 text-destructive"
                        : room.occupiedBeds > 0
                          ? "border-primary/40 bg-accent text-accent-foreground"
                          : "bg-background text-muted-foreground",
                    )}
                  >
                    {room.number}
                    <span className="ml-1.5 opacity-70">
                      {room.occupiedBeds}/{room.totalBeds}
                    </span>
                  </span>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl border bg-card">
          <div className="border-b p-5">
            <h3 className="font-display text-lg font-bold text-foreground">
              CRM
            </h3>
            <p className="text-sm text-muted-foreground">
              {pg.residentList.length === 0
                ? "Nobody has been added yet."
                : `${pg.residentList.length} guest${pg.residentList.length === 1 ? "" : "s"}, current first`}
            </p>
          </div>

          {pg.residentList.length > 0 && (
            <ul className="divide-y">
              {pg.residentList.map((resident) => (
                <li
                  key={`${resident.phone}-${resident.joinedAt}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate text-sm font-semibold text-foreground">
                      {resident.fullName}
                      {resident.status === "LEFT" && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                          Left
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {resident.phone} · Room {resident.roomNumber ?? "—"} ·{" "}
                      {ROOM_TYPE_LABELS[resident.roomType]}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {rupees.format(resident.monthlyRent)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
