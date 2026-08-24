"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BadgeIndianRupee, Check, Gift, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import {
  confirmListingFee,
  fetchPendingFees,
  type PendingFee,
} from "@/lib/api/publishing";

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

/**
 * Listing fees waiting to be confirmed.
 *
 * Confirming is the single action that publishes a PG and credits its referrer,
 * so the dialog spells out both before it happens.
 */
export function ListingFees() {
  const [fees, setFees] = useState<PendingFee[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingFee | null>(null);
  const [reference, setReference] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const response = await fetchPendingFees();
        if (active) setFees(response.data);
      } catch (caught) {
        if (!active) return;
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Could not load listing fees."
        );
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function confirm() {
    if (!pending) return;

    setIsConfirming(true);

    try {
      const response = await confirmListingFee(
        pending.pgCode,
        reference.trim() || undefined
      );
      toast.success(response.message);
      setPending(null);
      setReference("");
      setFees((await fetchPendingFees()).data);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "Could not confirm that fee. Try again."
      );
    } finally {
      setIsConfirming(false);
    }
  }

  if (error && !fees) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  if (!fees) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-3xl border bg-card">
        <LoaderCircle className="size-6 animate-spin text-brand-ink" />
        <span className="sr-only">Loading listing fees</span>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">
            Listing fees
          </h2>
          <p className="text-sm text-muted-foreground">
            {fees.length === 0
              ? "Nothing waiting."
              : `${fees.length} waiting to be confirmed`}
          </p>
        </div>
      </div>

      {fees.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">
          When an owner asks to publish, their fee shows up here.
        </p>
      ) : (
        <ul className="divide-y">
          {fees.map((fee) => (
            <li key={fee.id} className="flex flex-wrap items-center gap-4 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <BadgeIndianRupee className="size-5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {fee.pgName}{" "}
                  <span className="font-mono text-xs font-medium text-muted-foreground">
                    {fee.pgCode}
                  </span>
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {fee.ownerName} · {fee.ownerPhone} · asked{" "}
                  {formatDate(fee.requestedAt)}
                </p>
                {fee.referredByName && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-brand-ink">
                    <Gift className="size-3.5" />
                    {rupees.format(fee.rewardRupees)} goes to{" "}
                    {fee.referredByName}
                  </p>
                )}
              </div>

              <p className="font-display text-lg font-bold text-foreground">
                {rupees.format(fee.amount)}
              </p>

              <Button
                variant="outline"
                onClick={() => {
                  setPending(fee);
                  setReference("");
                }}
                className="h-10 gap-2 rounded-full font-semibold"
              >
                <Check className="size-4" />
                Confirm
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={pending !== null}
        onOpenChange={(next) => {
          if (!next && !isConfirming) setPending(null);
        }}
      >
        <DialogContent className="gap-5 rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Confirm {rupees.format(pending?.amount ?? 0)} received?
            </DialogTitle>
            <DialogDescription>
              This publishes {pending?.pgName} straight away
              {pending?.referredByName
                ? ` and credits ${rupees.format(pending.rewardRupees)} to ${pending.referredByName}.`
                : "."}{" "}
              It cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="feeReference">Payment reference</Label>
            <Input
              id="feeReference"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="UPI/425512345678"
              maxLength={120}
              className="h-11 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Optional, but it is what lets you match this to a bank entry later.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={isConfirming}
              onClick={() => setPending(null)}
              className="rounded-full font-semibold"
            >
              Cancel
            </Button>
            <Button
              disabled={isConfirming}
              onClick={() => void confirm()}
              className="gap-2 rounded-full font-semibold"
            >
              {isConfirming && <LoaderCircle className="size-4 animate-spin" />}
              {isConfirming ? "Confirming..." : "Confirm and publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
