"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { LoaderCircle, Wallet } from "lucide-react";
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
import { requestPayout, type Referrals } from "@/lib/api/account";

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Matches the API's rule, so a bad id is caught before a round trip. */
const UPI_ID_PATTERN = /^[\w.\-]{2,64}@[A-Za-z]{2,32}$/;

interface PayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onRequested: (referrals: Referrals) => void;
}

export function PayoutDialog({
  open,
  onOpenChange,
  amount,
  onRequested,
}: PayoutDialogProps) {
  const [upiId, setUpiId] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = UPI_ID_PATTERN.test(upiId.trim());

  function close(next: boolean) {
    if (isRequesting) return;
    if (!next) {
      setUpiId("");
      setError(null);
    }
    onOpenChange(next);
  }

  async function submit() {
    if (!isValid) return;

    setIsRequesting(true);
    setError(null);

    try {
      const response = await requestPayout(upiId.trim().toLowerCase());
      onRequested(response.data);
      toast.success(response.message);
      close(false);
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : "Could not request the payout. Try again.";

      setError(message);
      setIsRequesting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="gap-5 rounded-2xl sm:max-w-md">
        <DialogHeader>
          <span className="mb-1 flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Wallet className="size-5" />
          </span>
          <DialogTitle className="font-display text-lg font-bold">
            Withdraw {rupees.format(amount)}
          </DialogTitle>
          <DialogDescription>
            We send your whole available balance to one UPI id. It stays
            reserved until the transfer is made.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          className="flex flex-col gap-2"
        >
          <Label htmlFor="payoutUpiId">Your UPI id</Label>
          <Input
            id="payoutUpiId"
            value={upiId}
            onChange={(event) => setUpiId(event.target.value)}
            placeholder="yourname@okhdfcbank"
            autoComplete="off"
            spellCheck={false}
            maxLength={100}
            className="h-11 rounded-xl"
          />
          <p className="text-xs text-muted-foreground">
            Check it carefully — money sent to the wrong id cannot be recovered.
          </p>

          {error && (
            <p className="mt-1 text-sm font-medium text-destructive">{error}</p>
          )}

          <DialogFooter className="mt-3">
            <Button
              type="button"
              variant="outline"
              disabled={isRequesting}
              onClick={() => close(false)}
              className="rounded-full font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isRequesting}
              className="gap-2 rounded-full font-semibold"
            >
              {isRequesting && <LoaderCircle className="size-4 animate-spin" />}
              {isRequesting ? "Requesting..." : "Request payout"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
