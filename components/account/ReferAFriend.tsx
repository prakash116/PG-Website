"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check, Clock, Copy, Gift, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { fetchReferrals, type Referrals } from "@/lib/api/account";

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

export function ReferAFriend() {
  const [referrals, setReferrals] = useState<Referrals | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const response = await fetchReferrals();
        if (active) setReferrals(response.data);
      } catch (caught) {
        if (!active) return;
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Could not load your referrals."
        );
      }
    })();

    return () => {
      active = false;
    };
  }, []);

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

  if (!referrals) {
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

  return (
    <div className="max-w-3xl">
      <div className="rounded-3xl border bg-gradient-to-b from-accent to-card p-6 text-center sm:p-8">
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
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy code"}
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground">Earned</p>
          <p className="mt-1.5 font-display text-2xl font-bold text-brand-ink">
            {rupees.format(referrals.earnedRupees)}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="size-3.5" />
            Waiting to go live
          </p>
          <p className="mt-1.5 font-display text-2xl font-bold text-foreground">
            {referrals.pendingReferrals}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border bg-card p-6 sm:p-7">
        <h3 className="font-display text-lg font-bold text-foreground">
          Your referrals
        </h3>

        {referrals.rewards.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {referrals.pendingReferrals > 0
              ? `${referrals.pendingReferrals} PG${
                  referrals.pendingReferrals === 1 ? " has" : "s have"
                } used your code but ${
                  referrals.pendingReferrals === 1 ? "is" : "are"
                } not live yet. You earn as soon as ${
                  referrals.pendingReferrals === 1 ? "it does" : "they do"
                }.`
              : "Nobody has used your code yet."}
          </p>
        ) : (
          <ul className="mt-4 divide-y">
            {referrals.rewards.map((reward) => (
              <li
                key={reward.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {reward.pgName}
                  </p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {reward.pgCode} · {formatDate(reward.earnedAt)}
                  </p>
                </div>
                <p className="font-display text-base font-bold text-success">
                  + {rupees.format(reward.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
