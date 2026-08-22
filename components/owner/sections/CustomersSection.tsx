"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import {
  CalendarCheck,
  CircleCheck,
  CircleUserRound,
  Clock,
  Mail,
  Phone,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  VISIT_STATUS_LABELS,
  type Visit,
  type VisitStatus,
} from "@/lib/api/visits";
import { useVisitsStore, type VisitFilter } from "@/stores/visits-store";
import { PageHeader } from "../PageHeader";
import { NoPgState, PgErrorState } from "./OverviewSection";

const FILTERS: Array<{ value: VisitFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "New" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Visited" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STATUS_STYLES: Record<VisitStatus, string> = {
  PENDING: "bg-primary/15 text-brand-ink",
  CONFIRMED: "bg-success/15 text-success",
  COMPLETED: "bg-secondary text-muted-foreground",
  CANCELLED: "bg-destructive/10 text-destructive",
};

const longDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No date given";

export function CustomersSection() {
  const {
    visits,
    filter,
    isLoading,
    pendingId,
    hasNoPg,
    error,
    load,
    setFilter,
    setStatus: setVisitStatus,
  } = useVisitsStore();

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(visit: Visit, status: VisitStatus) {
    try {
      await setVisitStatus(visit.id, status);
      toast.success(`${visit.fullName}: ${VISIT_STATUS_LABELS[status]}.`);
    } catch (updateError: unknown) {
      toast.error(
        updateError instanceof Error
          ? updateError.message
          : "Could not update the request."
      );
    }
  }

  if (isLoading && visits.length === 0 && !error && !hasNoPg) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (hasNoPg) return <NoPgState />;
  if (error) return <PgErrorState message={error} onRetry={load} />;

  const newCount = visits.filter((visit) => visit.status === "PENDING").length;

  return (
    <>
      <PageHeader
        title="Customers"
        description="People who asked to visit your PG, with their contact details."
      />

      <div className="grid gap-5">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filter === option.value}
              onClick={() => void setFilter(option.value)}
              className={cn(
                "h-10 rounded-full border px-4 text-[13px] font-semibold transition-all",
                filter === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {option.label}
              {option.value === "PENDING" && newCount > 0 && filter !== "PENDING"
                ? ` (${newCount})`
                : ""}
            </button>
          ))}
        </div>

        {visits.length === 0 ? (
          <p className="rounded-2xl border border-dashed bg-card px-6 py-14 text-center text-sm text-muted-foreground">
            {filter === "ALL"
              ? "Nobody has booked a visit yet. Requests from the website land here with the customer's name and number."
              : "Nothing in this state."}
          </p>
        ) : (
          <ul className="grid gap-3">
            {visits.map((visit) => (
              <li
                key={visit.id}
                className="rounded-2xl border bg-card p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold">
                        {visit.fullName}
                      </h3>
                      <span className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
                        <CircleUserRound className="size-3" />
                        Pzee account
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-bold",
                          STATUS_STYLES[visit.status]
                        )}
                      >
                        {VISIT_STATUS_LABELS[visit.status]}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted-foreground">
                      <a
                        href={`tel:${visit.phone}`}
                        className="flex items-center gap-1.5 font-medium text-foreground hover:text-brand-ink"
                      >
                        <Phone className="size-3.5" />
                        {visit.phone}
                      </a>
                      <a
                        href={`mailto:${visit.email}`}
                        className="flex items-center gap-1.5 hover:text-brand-ink"
                      >
                        <Mail className="size-3.5" />
                        {visit.email}
                      </a>
                      <span className="flex items-center gap-1.5">
                        <CalendarCheck className="size-3.5" />
                        {longDate(visit.preferredDate)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        Asked {longDate(visit.requestedAt)}
                      </span>
                    </div>

                    {visit.message && (
                      <p className="mt-3 rounded-xl bg-secondary/50 px-3.5 py-2.5 text-[13px] leading-relaxed">
                        “{visit.message}”
                      </p>
                    )}
                  </div>

                  {visit.status !== "CANCELLED" && (
                    <div className="flex flex-wrap gap-2">
                      {visit.status === "PENDING" && (
                        <Button
                          type="button"
                          disabled={pendingId === visit.id}
                          onClick={() => setStatus(visit, "CONFIRMED")}
                          className="h-9 rounded-full px-4 text-[13px] font-semibold"
                        >
                          <CircleCheck className="size-4" />
                          Confirm
                        </Button>
                      )}
                      {visit.status === "CONFIRMED" && (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={pendingId === visit.id}
                          onClick={() => setStatus(visit, "COMPLETED")}
                          className="h-9 rounded-full px-4 text-[13px] font-semibold"
                        >
                          Mark visited
                        </Button>
                      )}
                      {visit.status !== "COMPLETED" && (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={pendingId === visit.id}
                          onClick={() => setStatus(visit, "CANCELLED")}
                          aria-label={`Cancel ${visit.fullName}'s visit`}
                          className="size-9 rounded-full p-0 text-destructive"
                        >
                          <XCircle className="size-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
