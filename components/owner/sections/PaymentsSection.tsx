"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeIndianRupee,
  CalendarClock,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePaymentsStore, type EarningsPeriod } from "@/stores/payments-store";
import { PageHeader } from "../PageHeader";
import { NoPgState, PgErrorState } from "./OverviewSection";

const rupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const PERIODS: Array<{ value: EarningsPeriod; label: string }> = [
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
  { value: "all", label: "All time" },
];

/** "2026-08" → "Aug", without letting a timezone shift the month. */
function monthLabel(month: string): string {
  const [year, index] = month.split("-").map(Number);
  return new Date(year, index - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
  });
}

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function Tile({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Wallet;
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

export function PaymentsSection() {
  const { summary, period, isLoading, hasNoPg, error, load, setPeriod } =
    usePaymentsStore();

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
  if (error && !summary) return <PgErrorState message={error} onRetry={load} />;
  if (!summary) return null;

  const peak = Math.max(...summary.monthly.map((entry) => entry.collected), 1);
  const periodLabel =
    PERIODS.find((entry) => entry.value === period)?.label ?? "This month";

  return (
    <>
      <PageHeader
        title="Payments"
        description="What you have earned, what is still owed, and how rent reaches you."
      />

      <div className="grid gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-medium text-muted-foreground">
            Collected:
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
            icon={BadgeIndianRupee}
            label="Total earnings"
            value={rupees(summary.totalEarnings)}
            hint="Every payment ever recorded."
            tone={summary.totalEarnings > 0 ? "success" : undefined}
          />
          <Tile
            icon={TrendingUp}
            label="Collected"
            value={rupees(summary.collected)}
            hint={periodLabel}
          />
          <Tile
            icon={Wallet}
            label="Due amount"
            value={rupees(summary.dueAmount)}
            hint={
              summary.guestsInArrears > 0
                ? `${summary.guestsInArrears} guest${summary.guestsInArrears === 1 ? "" : "s"} behind on rent.`
                : "Everyone is up to date."
            }
            tone={summary.dueAmount > 0 ? "danger" : "success"}
          />
          <Tile
            icon={CalendarClock}
            label="Expected monthly"
            value={rupees(summary.expectedMonthly)}
            hint="Rent plus services across your guests."
          />
        </div>

        {/* Six-month trend */}
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Collected by month</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            The last six months.
          </p>

          <ul className="mt-6 flex items-end gap-3 sm:gap-5">
            {summary.monthly.map((entry) => (
              <li key={entry.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {entry.collected > 0
                    ? `₹${(entry.collected / 1000).toFixed(entry.collected >= 10000 ? 0 : 1)}k`
                    : "—"}
                </span>
                <div
                  role="img"
                  aria-label={`${monthLabel(entry.month)}: ${rupees(entry.collected)}`}
                  style={{
                    height: `${Math.max(4, (entry.collected / peak) * 120)}px`,
                  }}
                  className={cn(
                    "w-full rounded-t-lg transition-all",
                    entry.collected > 0 ? "bg-primary" : "bg-border"
                  )}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {monthLabel(entry.month)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Payment gateway */}
        <section className="rounded-2xl border border-dashed bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <ShieldCheck className="size-5 text-brand-ink" />
                Online payments
              </h2>
              <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
                Rent is recorded by hand today. Connecting Razorpay would let
                guests pay from their phone and mark themselves paid
                automatically.
              </p>

              <ul className="mt-4 grid gap-1.5 text-[13px]">
                {[
                  "A Razorpay account, with its key id and secret",
                  "A webhook endpoint so only settled payments are recorded",
                  "Your bank account for payouts",
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-muted-foreground">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Not connected yet, so nothing on this page comes from a gateway.
                Every figure above is from payments recorded in the CRM.
              </p>
            </div>

            <Button
              render={
                <a
                  href="https://dashboard.razorpay.com/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              variant="outline"
              className="h-11 shrink-0 rounded-full px-5 font-semibold"
            >
              Get Razorpay keys
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </section>

        {/* Recent payments */}
        <section className="rounded-2xl border bg-card p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold">
                Recent payments
              </h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                The last 20 recorded.
              </p>
            </div>
            <Button
              render={<Link href="/pg-owner/crm" />}
              variant="outline"
              className="h-9 rounded-full px-4 text-[13px] font-semibold"
            >
              <Receipt className="size-4" />
              Record a payment
            </Button>
          </div>

          {summary.recent.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
              No payments recorded yet. Collect rent from a guest under CRM and
              it appears here.
            </p>
          ) : (
            <ul className="mt-5 divide-y">
              {summary.recent.map((payment) => (
                <li
                  key={payment.id}
                  className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {payment.residentName}
                      {payment.roomNumber ? (
                        <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          Room {payment.roomNumber}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {shortDate(payment.paidOn)}
                      {payment.note ? ` · ${payment.note}` : ""}
                    </p>
                  </div>
                  <span className="font-display text-base font-extrabold tabular-nums text-success">
                    +{rupees(payment.amount)}
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
