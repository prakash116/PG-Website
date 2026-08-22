"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type Resident } from "@/lib/api/crm";
import { useCrmStore } from "@/stores/crm-store";
import { EditorDialog } from "../EditorDialog";

interface GuestServicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: Resident;
  /** What this PG offers, drawn from its amenities and meals. */
  available: string[];
}

const rupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const digitsOnly = (value: string) => value.replace(/\D/g, "");

export function GuestServicesDialog({
  open,
  onOpenChange,
  guest,
  available,
}: GuestServicesDialogProps) {
  // Amounts are kept for every offered service, so unticking and re-ticking
  // does not lose what was typed.
  const [amounts, setAmounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      available.map((name) => {
        const taken = guest.services.find((service) => service.name === name);
        return [name, taken ? String(taken.monthlyAmount) : ""];
      })
    )
  );

  const [selected, setSelected] = useState<string[]>(() =>
    guest.services.map((service) => service.name)
  );

  const isSaving = useCrmStore((state) => state.isSaving);
  const editGuest = useCrmStore((state) => state.editGuest);

  const total = selected.reduce(
    (running, name) => running + Number(amounts[name] || 0),
    0
  );

  function toggle(name: string) {
    setSelected((previous) =>
      previous.includes(name)
        ? previous.filter((entry) => entry !== name)
        : [...previous, name]
    );
  }

  async function handleSave() {
    try {
      await editGuest(guest.id, {
        services: selected.map((name) => ({
          name,
          monthlyAmount: Number(amounts[name] || 0),
        })),
      });
      toast.success(`Services updated for ${guest.fullName}.`);
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
    }
  }

  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Services"
      description={`${guest.fullName} · rent ${rupees(guest.monthlyRent)} a month`}
      isSaving={isSaving}
      onSave={handleSave}
    >
      {available.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          This PG has no amenities listed yet. Add them in PG Info and they will
          appear here as services you can charge for.
        </p>
      ) : (
        <div className="grid gap-2.5">
          {available.map((name) => {
            const isOn = selected.includes(name);

            return (
              <div
                key={name}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-xl border p-3 transition-colors",
                  isOn ? "border-primary/40 bg-accent/30" : "bg-card"
                )}
              >
                <button
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => toggle(name)}
                  className={cn(
                    "flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-all",
                    isOn
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {isOn && <Check className="size-3.5" strokeWidth={3} />}
                  {name}
                </button>

                {isOn && (
                  <label className="ml-auto flex items-center gap-2 text-[13px] text-muted-foreground">
                    ₹ per month
                    <Input
                      inputMode="numeric"
                      value={amounts[name] ?? ""}
                      onChange={(event) =>
                        setAmounts((previous) => ({
                          ...previous,
                          [name]: digitsOnly(event.target.value),
                        }))
                      }
                      placeholder="0"
                      aria-label={`Monthly amount for ${name}`}
                      className="h-9 w-28 rounded-lg bg-card text-right"
                    />
                  </label>
                )}
              </div>
            );
          })}

          <div className="mt-1 flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
            <span className="text-sm font-medium text-muted-foreground">
              Services total
            </span>
            <span className="font-display text-lg font-extrabold tabular-nums">
              {rupees(total)}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Charged on top of rent, so this guest owes{" "}
            <span className="font-semibold text-foreground">
              {rupees(guest.monthlyRent + total)}
            </span>{" "}
            a month. Set an amount to 0 for a service that is included free.
          </p>
        </div>
      )}
    </EditorDialog>
  );
}
