"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Resident } from "@/lib/api/crm";
import { useCrmStore } from "@/stores/crm-store";
import { EditorDialog } from "../EditorDialog";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: Resident;
}

const rupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const digitsOnly = (value: string) => value.replace(/\D/g, "");
const today = () => new Date().toISOString().slice(0, 10);

export function PaymentDialog({
  open,
  onOpenChange,
  guest,
}: PaymentDialogProps) {
  // Pre-filled with what they owe, which is the usual amount collected.
  const [amount, setAmount] = useState(
    guest.pendingAmount > 0 ? String(guest.pendingAmount) : String(guest.monthlyRent)
  );
  const [paidOn, setPaidOn] = useState(today());
  const [note, setNote] = useState("");
  const isSaving = useCrmStore((state) => state.isSaving);
  const pay = useCrmStore((state) => state.pay);

  async function handleSave() {
    if (Number(amount || 0) < 1) {
      toast.error("Please enter the amount collected.");
      return;
    }

    if (paidOn > today()) {
      toast.error("A payment cannot be dated in the future.");
      return;
    }

    try {
      await pay(guest.id, {
        amount: Number(amount),
        paidOn,
        ...(note.trim() && { note: note.trim() }),
      });
      toast.success(`${rupees(Number(amount))} recorded for ${guest.fullName}.`);
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
    }
  }

  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Record a payment"
      description={`${guest.fullName} · ${rupees(guest.pendingAmount)} pending`}
      isSaving={isSaving}
      onSave={handleSave}
    >
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="payment-amount">Amount collected (₹)</Label>
          <Input
            id="payment-amount"
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(digitsOnly(event.target.value))}
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment-date">Paid on</Label>
          <Input
            id="payment-date"
            type="date"
            max={today()}
            value={paidOn}
            onChange={(event) => setPaidOn(event.target.value)}
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment-note">Note</Label>
          <Input
            id="payment-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Paid by UPI"
            maxLength={200}
            className="h-11 rounded-xl"
          />
        </div>

        {guest.payments.length > 0 && (
          <div className="rounded-xl border bg-secondary/40 p-4">
            <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
              Recent payments
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {guest.payments.slice(0, 4).map((payment) => (
                <li
                  key={payment.id}
                  className="flex justify-between text-[13px]"
                >
                  <span className="text-muted-foreground">
                    {new Date(payment.paidOn).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {rupees(payment.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </EditorDialog>
  );
}
