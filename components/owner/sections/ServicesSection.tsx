"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CircleUserRound,
  ConciergeBell,
  IndianRupee,
  Settings2,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { type Resident } from "@/lib/api/crm";
import { ROOM_TYPE_LABELS, type PgDetail } from "@/lib/api/pg";
import { useCrmStore } from "@/stores/crm-store";
import { usePgStore } from "@/stores/pg-store";
import { PageHeader } from "../PageHeader";
import { GuestServicesDialog } from "./GuestServicesDialog";
import { NoPgState, PgErrorState } from "./OverviewSection";

const rupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;

/**
 * What this PG can charge for: everything ticked in PG Info, plus meals when
 * they are offered. Anything already allocated to a guest is kept in the list
 * even if the amenity was later removed, so nothing disappears silently.
 */
function servicesOffered(pg: PgDetail, residents: Resident[]): string[] {
  const offered = new Set<string>(pg.amenities);

  if (pg.foodIncluded) offered.add("Food");
  for (const guest of residents) {
    for (const service of guest.services) offered.add(service.name);
  }

  return [...offered].sort((a, b) => a.localeCompare(b));
}

function Tile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof UsersRound;
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

export function ServicesSection() {
  const { pg, hasNoPg, error: pgError, load: loadPg } = usePgStore();
  const {
    residents,
    isLoading,
    error: crmError,
    load: loadCrm,
  } = useCrmStore();
  const [managing, setManaging] = useState<Resident | null>(null);

  useEffect(() => {
    void loadPg();
    void loadCrm();
  }, [loadPg, loadCrm]);

  const offered = useMemo(
    () => (pg ? servicesOffered(pg, residents) : []),
    [pg, residents]
  );

  /** How many guests take each service, and what it brings in each month. */
  const usage = useMemo(
    () =>
      offered.map((name) => {
        const takers = residents.filter((guest) =>
          guest.services.some((service) => service.name === name)
        );

        return {
          name,
          guests: takers.length,
          monthly: takers.reduce(
            (running, guest) =>
              running +
              (guest.services.find((service) => service.name === name)
                ?.monthlyAmount ?? 0),
            0
          ),
        };
      }),
    [offered, residents]
  );

  if (isLoading && !pg) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (hasNoPg) return <NoPgState />;
  if (pgError && !pg) return <PgErrorState message={pgError} onRetry={loadPg} />;
  if (crmError && residents.length === 0) {
    return <PgErrorState message={crmError} onRetry={loadCrm} />;
  }
  if (!pg) return null;

  const guestsUsing = residents.filter(
    (guest) => guest.services.length > 0
  ).length;
  const monthlyIncome = residents.reduce(
    (running, guest) => running + guest.servicesTotal,
    0
  );

  return (
    <>
      <PageHeader
        title="Services"
        description="Which services each guest takes, and what they add to the rent."
      />

      <div className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Tile
            icon={ConciergeBell}
            label="Services offered"
            value={String(offered.length)}
            hint="From the amenities on your listing."
          />
          <Tile
            icon={UsersRound}
            label="Guests using services"
            value={`${guestsUsing} / ${residents.length}`}
            hint="Guests with at least one service."
          />
          <Tile
            icon={IndianRupee}
            label="Services income"
            value={rupees(monthlyIncome)}
            hint="Charged every month, on top of rent."
          />
        </div>

        {/* Per-service usage */}
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Service usage</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            How many guests take each one.
          </p>

          {offered.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No amenities on your listing yet. Add them in PG Info and they
              become services you can allocate here.
            </p>
          ) : (
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {usage.map((service) => (
                <li
                  key={service.name}
                  className="flex items-center gap-3 rounded-xl border bg-background p-3.5"
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                      service.guests > 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {service.guests}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {service.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {service.guests === 0
                        ? "Nobody takes this yet"
                        : `${service.guests} guest${service.guests === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {service.monthly > 0 ? rupees(service.monthly) : "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Per-guest allocation */}
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Guests</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Allocate services to a guest and set what each costs them.
          </p>

          {residents.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No guests staying yet. Add one under Total guests first.
            </p>
          ) : (
            <ul className="mt-5 divide-y">
              {residents.map((guest) => (
                <li
                  key={guest.id}
                  className="flex flex-wrap items-start gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{guest.fullName}</p>
                      {guest.hasAccount && (
                        <span className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
                          <CircleUserRound className="size-3" />
                          Pzee account
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      {ROOM_TYPE_LABELS[guest.roomType]}
                      {guest.roomNumber ? ` · Room ${guest.roomNumber}` : ""} ·{" "}
                      {guest.services.length} service
                      {guest.services.length === 1 ? "" : "s"}
                    </p>

                    {guest.services.length > 0 ? (
                      <ul className="mt-2.5 flex flex-wrap gap-1.5">
                        {guest.services.map((service) => (
                          <li
                            key={service.id}
                            className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium"
                          >
                            {service.name}
                            <span className="font-bold tabular-nums text-brand-ink">
                              {service.monthlyAmount > 0
                                ? rupees(service.monthlyAmount)
                                : "Free"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">
                        No services allocated.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Per month</p>
                      <p className="font-display text-lg font-extrabold tabular-nums">
                        {rupees(guest.monthlyTotal)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {rupees(guest.monthlyRent)} rent
                        {guest.servicesTotal > 0
                          ? ` + ${rupees(guest.servicesTotal)}`
                          : ""}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setManaging(guest)}
                      className="h-9 rounded-full px-4 text-[13px] font-semibold"
                    >
                      <Settings2 className="size-4" />
                      Manage
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {managing && (
        <GuestServicesDialog
          open
          onOpenChange={() => setManaging(null)}
          guest={managing}
          available={offered}
        />
      )}
    </>
  );
}
