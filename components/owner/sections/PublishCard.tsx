"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Check,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Gift,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import {
  fetchPublishStatus,
  requestPublish,
  type PublishStatus,
} from "@/lib/api/publishing";

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/**
 * Where the listing stands, and the one button that moves it forward.
 *
 * Three states, and the card says plainly which one you are in: private,
 * waiting on us to confirm your payment, or live.
 */
export function PublishCard() {
  const [status, setStatus] = useState<PublishStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const response = await fetchPublishStatus();
        if (active) setStatus(response.data);
      } catch (caught) {
        if (!active) return;
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Could not load your publish status."
        );
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function handlePublish() {
    setIsRequesting(true);

    try {
      const response = await requestPublish();
      setStatus(response.data);
      toast.success(response.message);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "Could not start publishing. Try again."
      );
    } finally {
      setIsRequesting(false);
    }
  }

  async function copyUpi(upiId: string) {
    try {
      await navigator.clipboard.writeText(upiId);
      toast.success("UPI id copied.");
    } catch {
      toast.error("Could not copy. Select the id and copy it by hand.");
    }
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-3xl border bg-card">
        <LoaderCircle className="size-6 animate-spin text-brand-ink" />
        <span className="sr-only">Loading publish status</span>
      </div>
    );
  }

  const awaitingConfirmation = status.fee?.status === "PENDING";

  return (
    <div className="rounded-3xl border bg-card p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={
              status.isPublished
                ? "flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success"
                : "flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground"
            }
          >
            {status.isPublished ? (
              <Eye className="size-5" />
            ) : (
              <EyeOff className="size-5" />
            )}
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              {status.isPublished ? "Your PG is live" : "Your PG is private"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {status.isPublished
                ? "Residents can find it and book a visit."
                : awaitingConfirmation
                  ? "Waiting for us to confirm your payment."
                  : `Publish it for a one-time ${rupees.format(status.feeRupees)}.`}
            </p>
          </div>
        </div>

        {status.isPublished ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
            <Check className="size-3.5" />
            Published
          </span>
        ) : awaitingConfirmation ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
            <Clock className="size-3.5" />
            Awaiting confirmation
          </span>
        ) : (
          <Button
            disabled={isRequesting}
            onClick={() => void handlePublish()}
            className="h-11 gap-2 rounded-full px-6 font-semibold"
          >
            {isRequesting && <LoaderCircle className="size-4 animate-spin" />}
            {isRequesting ? "Starting..." : "Publish"}
          </Button>
        )}
      </div>

      {awaitingConfirmation && (
        <div className="mt-5 rounded-2xl border bg-muted/40 p-5">
          <p className="text-sm font-semibold text-foreground">
            Send {rupees.format(status.fee?.amount ?? status.feeRupees)} to
            publish
          </p>

          {status.payeeUpiId ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="rounded-lg border bg-card px-3 py-2 font-mono text-sm font-semibold text-foreground">
                {status.payeeUpiId}
              </code>
              <Button
                variant="outline"
                onClick={() => void copyUpi(status.payeeUpiId)}
                className="h-10 gap-2 rounded-full font-semibold"
              >
                <Copy className="size-4" />
                Copy UPI id
              </Button>
            </div>
          ) : (
            // Better to say nothing is set up than to show a placeholder
            // somebody might actually pay.
            <p className="mt-2 text-sm text-muted-foreground">
              Payment details are not set up yet. Contact Pzee to pay and we
              will publish your PG.
            </p>
          )}

          <p className="mt-3 text-xs text-muted-foreground">
            Your PG goes live as soon as we confirm the payment. You only pay
            this once.
          </p>
        </div>
      )}

      {status.referredBy && (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Gift className="size-3.5" />
          Referred by {status.referredBy}
          {!status.isPublished && " — they are credited when your PG goes live."}
        </p>
      )}
    </div>
  );
}
