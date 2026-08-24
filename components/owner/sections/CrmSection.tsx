"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  BedDouble,
  CircleUserRound,
  IndianRupee,
  LogOut,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  UsersRound,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  USER_TYPE_LABELS,
  type Resident,
  type ResidentStatus,
} from "@/lib/api/crm";
import { ROOM_TYPE_LABELS } from "@/lib/api/pg";
import { useCrmStore, type CrmPeriod } from "@/stores/crm-store";
import { PageHeader } from "../PageHeader";
import { GuestDialog } from "./GuestDialog";
import { NoPgState, PgErrorState } from "./OverviewSection";
import { PaymentDialog } from "./PaymentDialog";

const rupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const shortDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const PERIODS: Array<{ value: CrmPeriod; label: string }> = [
  { value: "today", label: "Today" },
  { value: "month", label: "This month" },
  { value: "all", label: "All time" },
];

function Tile({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof UsersRound;
  label: string;
  value: string;
  hint: string;
  tone?: "danger" | "success";
}) {
  return (
    <article className="rounded-2xl border bg-card p-5">
      <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-display text-3xl font-extrabold",
          tone === "danger" && "text-destructive",
          tone === "success" && "text-success"
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>
    </article>
  );
}

function GuestRow({
  guest,
  onEdit,
  onPay,
}: {
  guest: Resident;
  onEdit: () => void;
  onPay: () => void;
}) {
  const checkout = useCrmStore((state) => state.checkout);
  const removeGuest = useCrmStore((state) => state.removeGuest);
  const isActive = guest.status === "ACTIVE";

  async function act(action: () => Promise<void>, done: string) {
    try {
      await action();
      toast.success(done);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not do that.");
    }
  }

  return (
    <article className="rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-bold">{guest.fullName}</h3>
            {guest.hasAccount && (
              <span className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
                <CircleUserRound className="size-3" />
                Pzee account
              </span>
            )}
            {!isActive && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                Moved out {shortDate(guest.leftAt)}
              </span>
            )}
          </div>

          <p className="mt-1 text-[13px] text-muted-foreground">
            {guest.phone} · {ROOM_TYPE_LABELS[guest.roomType]}
            {guest.userType ? ` · ${USER_TYPE_LABELS[guest.userType]}` : ""}
          </p>

          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[13px] sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Rent</dt>
              <dd className="font-semibold tabular-nums">
                {rupees(guest.monthlyRent)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last paid</dt>
              <dd className="font-semibold">
                {shortDate(guest.lastPaymentDate)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Due on</dt>
              <dd className="font-semibold">{shortDate(guest.dueDate)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Pending</dt>
              <dd
                className={cn(
                  "font-semibold tabular-nums",
                  guest.pendingAmount > 0 ? "text-destructive" : "text-success"
                )}
              >
                {guest.pendingAmount > 0 ? rupees(guest.pendingAmount) : "Clear"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap gap-2">
          {isActive && (
            <Button
              type="button"
              onClick={onPay}
              className="h-9 rounded-full px-4 text-[13px] font-semibold"
            >
              <IndianRupee className="size-3.5" />
              Record payment
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onEdit}
            aria-label={`Edit ${guest.fullName}`}
            className="size-9 rounded-full p-0"
          >
            <Pencil className="size-4" />
          </Button>
          {isActive ? (
            <Button
              type="button"
              variant="outline"
              aria-label={`Check out ${guest.fullName}`}
              onClick={() =>
                act(
                  () => checkout(guest.id),
                  `${guest.fullName} checked out. Their bed is free again.`
                )
              }
              className="size-9 rounded-full p-0"
            >
              <LogOut className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              aria-label={`Delete ${guest.fullName}`}
              onClick={() =>
                act(() => removeGuest(guest.id), "Guest record deleted.")
              }
              className="size-9 rounded-full p-0 text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function CrmSection() {
  const {
    residents,
    summary,
    status,
    search,
    period,
    isLoading,
    hasNoPg,
    error,
    load,
    setStatus,
    setSearch,
    setPeriod,
  } = useCrmStore();

  const [editing, setEditing] = useState<Resident | "new" | null>(null);
  const [paying, setPaying] = useState<Resident | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading && !summary) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (hasNoPg) return <NoPgState />;
  if (error && !summary) return <PgErrorState message={error} onRetry={() => void load(true)} />;
  if (!summary) return null;

  const roomTypeOptions = summary.occupancy.map((room) => ({
    type: room.type,
    availableBeds: room.availableBeds,
  }));

  const canAdd = summary.availableBeds > 0;

  return (
    <>
      <PageHeader
        title="CRM"
        description="Your guests, what they owe, and what you have collected."
        action={
          <Button
            type="button"
            disabled={!canAdd}
            onClick={() => setEditing("new")}
            className="h-11 rounded-full px-5 font-semibold"
          >
            <Plus className="size-4" />
            Add guest
          </Button>
        }
      />

      <div className="grid gap-5">
        {/* Period filter drives the money tiles only. */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-medium text-muted-foreground">
            Collections:
          </span>
          {PERIODS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={period === option.value}
              onClick={() => void setPeriod(option.value)}
              className={cn(
                "h-9 rounded-full border px-4 text-[13px] font-semibold transition-all",
                period === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile
            icon={UsersRound}
            label="Total guests"
            value={String(summary.totalGuests)}
            hint="Staying right now."
          />
          <Tile
            icon={Wallet}
            label="Pending amount"
            value={rupees(summary.pendingAmount)}
            hint="Owed across every guest."
            tone={summary.pendingAmount > 0 ? "danger" : undefined}
          />
          <Tile
            icon={TrendingUp}
            label="Total collection"
            value={rupees(summary.collected)}
            hint={
              PERIODS.find((p) => p.value === period)?.label ?? "This month"
            }
            tone={summary.collected > 0 ? "success" : undefined}
          />
          <Tile
            icon={BedDouble}
            label="Beds free"
            value={`${summary.availableBeds} / ${summary.totalBeds}`}
            hint="Counted from who is staying."
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => void setSearch(event.target.value)}
              placeholder="Search by name or number"
              aria-label="Search guests"
              className="h-11 rounded-full bg-card pl-10"
            />
          </div>

          {(["ACTIVE", "LEFT"] as ResidentStatus[]).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              onClick={() => void setStatus(value)}
              className={cn(
                "h-11 rounded-full border px-4 text-[13px] font-semibold transition-all",
                status === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {value === "ACTIVE" ? "Staying now" : "Moved out"}
            </button>
          ))}
        </div>

        {!canAdd && status === "ACTIVE" && (
          <p className="rounded-xl border bg-card px-4 py-3 text-[13px] text-muted-foreground">
            Every bed is taken. Add rooms in Room management to take more guests.
          </p>
        )}

        {residents.length === 0 ? (
          <p className="rounded-2xl border border-dashed bg-card px-6 py-14 text-center text-sm text-muted-foreground">
            {status === "ACTIVE"
              ? "No guests recorded yet. Add one and their bed is counted automatically."
              : "Nobody has moved out yet."}
          </p>
        ) : (
          <div className="grid gap-3">
            {residents.map((guest) => (
              <GuestRow
                key={guest.id}
                guest={guest}
                onEdit={() => setEditing(guest)}
                onPay={() => setPaying(guest)}
              />
            ))}
          </div>
        )}
      </div>

      {editing && (
        <GuestDialog
          open
          onOpenChange={() => setEditing(null)}
          guest={editing === "new" ? undefined : editing}
          roomTypeOptions={roomTypeOptions}
        />
      )}

      {paying && (
        <PaymentDialog
          open
          onOpenChange={() => setPaying(null)}
          guest={paying}
        />
      )}
    </>
  );
}
