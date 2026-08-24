"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  Gift,
  LoaderCircle,
  Wallet,
} from "lucide-react";
import { PayoutDialog } from "@/components/account/PayoutDialog";
import { Button } from "@/components/ui/button";
import {
  fetchReferrals,
  type ReferralTransaction,
} from "@/lib/api/account";
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

/** Each status gets its own chip, because "requested" and "paid" are not the
 *  same news and should not look alike. */
const STATUS_STYLES: Record<ReferralTransaction["status"], string> = {
  EARNED: "bg-success/10 text-success",
  PAID: "bg-success/10 text-success",
  REQUESTED: "bg-secondary text-secondary-foreground",
  REJECTED: "bg-destructive/10 text-destructive",
};

const STATUS_LABELS: Record<ReferralTransaction["status"], string> = {
  EARNED: "Earned",
  PAID: "Paid",
  REQUESTED: "Requested",
  REJECTED: "Rejected",
};

function StatTile({
  label,
  value,
  icon: Icon,
  emphasis,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        emphasis ? "border-brand-ink/25 bg-accent/40" : "bg-card"
      )}
    >
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 font-display text-2xl font-bold",
          emphasis ? "text-brand-ink" : "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function ReferAFriend() {
  const [copied, setCopied] = useState(false);
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);

  // Cached across navigation. `setReferrals` writes the payout response
  // straight into the cache, so requesting one needs no second round trip.
  const {
    data: referrals,
    isLoading,
    error,
    set: setReferrals,
  } = useCachedResource(
    "me/referrals",
    async () => (await fetchReferrals()).data,
  );

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Select the code and copy it by hand.");
    }
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  if (isLoading || !referrals) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <LoaderCircle className="size-7 animate-spin text-brand-ink" />
        <span className="sr-only">Loading your referrals</span>
      </div>
    );
  }

  // Only a customer has a code; an owner reaching this page has none.
  if (!referrals.referralCode) {
    return (
      <div className="max-w-xl rounded-3xl border bg-card p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Gift className="size-7" />
        </span>
        <h2 className="mt-5 font-display text-xl font-bold text-foreground">
          Referral codes are for residents
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account does not have one.
        </p>
      </div>
    );
  }

  const canWithdraw = referrals.availableRupees > 0 && !referrals.hasOpenPayout;

  return (
    <div className="max-w-3xl">
      {/* The code, and the balance you can act on, in one place. */}
      <div className="overflow-hidden rounded-3xl border bg-gradient-to-b from-accent to-card">
        <div className="p-6 text-center sm:p-8">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-card text-brand-ink">
            <Gift className="size-6" />
          </span>

          <h2 className="mt-4 font-display text-xl font-bold text-foreground">
            Earn {rupees.format(referrals.rewardPerReferral)} per PG
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Give this code to a PG owner. When they register with it and their
            listing goes live, {rupees.format(referrals.rewardPerReferral)} is
            credited to you.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <code className="rounded-xl border bg-card px-4 py-3 font-mono text-lg font-bold tracking-wider text-foreground">
              {referrals.referralCode}
            </code>
            <Button
              variant="outline"
              onClick={() => void copy(referrals.referralCode as string)}
              className="h-12 gap-2 rounded-full bg-card px-5 font-semibold"
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? "Copied" : "Copy code"}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t bg-card/60 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Available to withdraw
            </p>
            <p className="mt-0.5 font-display text-3xl font-bold text-brand-ink">
              {rupees.format(referrals.availableRupees)}
            </p>
          </div>

          {referrals.hasOpenPayout ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground">
              <Clock className="size-4" />
              {rupees.format(referrals.pendingPayoutRupees)} on the way
            </span>
          ) : (
            <Button
              disabled={!canWithdraw}
              onClick={() => setIsPayoutOpen(true)}
              className="h-12 gap-2 rounded-full px-6 text-base font-semibold"
            >
              <Wallet className="size-4.5" />
              Withdraw
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Total earned"
          value={rupees.format(referrals.earnedRupees)}
          icon={Gift}
          emphasis
        />
        <StatTile
          label="Paid out"
          value={rupees.format(referrals.paidOutRupees)}
          icon={ArrowUpRight}
        />
        <StatTile
          label="Waiting to go live"
          value={String(referrals.pendingReferrals)}
          icon={Clock}
        />
      </div>

      <div className="mt-4 rounded-3xl border bg-card p-6 sm:p-7">
        <h3 className="font-display text-lg font-bold text-foreground">
          Transaction history
        </h3>

        {referrals.transactions.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {referrals.pendingReferrals > 0
              ? `${referrals.pendingReferrals} PG${
                  referrals.pendingReferrals === 1 ? " has" : "s have"
                } used your code but ${
                  referrals.pendingReferrals === 1 ? "is" : "are"
                } not live yet. You earn as soon as ${
                  referrals.pendingReferrals === 1 ? "it does" : "they do"
                }.`
              : "Nothing yet. Share your code to get started."}
          </p>
        ) : (
          <ul className="mt-4 divide-y">
            {referrals.transactions.map((entry) => {
              const isCredit = entry.kind === "EARNED";

              return (
                <li
                  key={`${entry.kind}-${entry.id}`}
                  className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full",
                      isCredit
                        ? "bg-success/10 text-success"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {isCredit ? (
                      <ArrowDownLeft className="size-4" />
                    ) : (
                      <ArrowUpRight className="size-4" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {entry.label}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.reference && (
                        <span className="font-mono">{entry.reference} · </span>
                      )}
                      {formatDate(entry.at)}
                    </p>
                    {entry.note && (
                      <p className="mt-1 text-xs text-destructive">
                        {entry.note}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        STATUS_STYLES[entry.status]
                      )}
                    >
                      {STATUS_LABELS[entry.status]}
                    </span>
                    <p
                      className={cn(
                        "w-20 text-right font-display text-base font-bold",
                        isCredit ? "text-success" : "text-foreground"
                      )}
                    >
                      {isCredit ? "+" : "−"} {rupees.format(entry.amount)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <PayoutDialog
        open={isPayoutOpen}
        onOpenChange={setIsPayoutOpen}
        amount={referrals.availableRupees}
        onRequested={setReferrals}
      />
    </div>
  );
}
