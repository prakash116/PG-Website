"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  COOLING_LABELS,
  PG_GENDER_LABELS,
  type Cooling,
  type PgDetail,
  type PgGender,
} from "@/lib/api/pg";
import { usePgStore } from "@/stores/pg-store";
import { EditorDialog } from "./EditorDialog";

interface PgBasicsFormProps {
  pg: PgDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Empty string means "not set yet", which the API takes as undefined. */
interface BasicsState {
  name: string;
  location: string;
  city: string;
  description: string;
  price: string;
  deposit: string;
  gender: PgGender | "";
  cooling: Cooling | "";
}

function toState(pg: PgDetail): BasicsState {
  return {
    name: pg.name,
    location: pg.location,
    city: pg.city ?? "",
    description: pg.description ?? "",
    price: pg.price === null ? "" : String(pg.price),
    deposit: pg.deposit === null ? "" : String(pg.deposit),
    gender: pg.gender ?? "",
    cooling: pg.cooling ?? "",
  };
}

const fieldBox = "space-y-2";
const inputStyle = "h-11 rounded-xl";

export function PgBasicsForm({ pg, open, onOpenChange }: PgBasicsFormProps) {
  const [form, setForm] = useState<BasicsState>(() => toState(pg));
  const isSaving = usePgStore((state) => state.isSaving);
  const saveDetails = usePgStore((state) => state.saveDetails);

  function set(patch: Partial<BasicsState>) {
    setForm((previous) => ({ ...previous, ...patch }));
  }

  // Reopening after a cancel should show the stored values, not the edits.
  function handleOpenChange(next: boolean) {
    if (!next) setForm(toState(pg));
    onOpenChange(next);
  }

  async function handleSave() {
    if (form.name.trim().length < 2) {
      toast.error("Please enter your PG house name.");
      return;
    }

    if (!form.location.trim()) {
      toast.error("Please enter your PG location.");
      return;
    }

    try {
      await saveDetails({
        name: form.name.trim(),
        location: form.location.trim(),
        city: form.city.trim(),
        description: form.description.trim(),
        ...(form.price !== "" && { price: Number(form.price) }),
        ...(form.deposit !== "" && { deposit: Number(form.deposit) }),
        ...(form.gender && { gender: form.gender }),
        ...(form.cooling && { cooling: form.cooling }),
      });
      toast.success("Basics saved.");
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
    }
  }

  return (
    <EditorDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Basics"
      description="The details residents see first on your listing."
      isSaving={isSaving}
      onSave={handleSave}
    >
      <div className={fieldBox}>
        <Label htmlFor="pg-name">PG house name</Label>
        <Input
          id="pg-name"
          value={form.name}
          onChange={(event) => set({ name: event.target.value })}
          maxLength={120}
          className={inputStyle}
        />
      </div>

      <div className={fieldBox}>
        <Label htmlFor="pg-location">Location</Label>
        <Input
          id="pg-location"
          value={form.location}
          onChange={(event) => set({ location: event.target.value })}
          placeholder="Building, street, area"
          className={inputStyle}
        />
      </div>

      <div className={fieldBox}>
        <Label htmlFor="pg-city">City</Label>
        <Input
          id="pg-city"
          value={form.city}
          onChange={(event) => set({ city: event.target.value })}
          placeholder="New Delhi"
          className={inputStyle}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={fieldBox}>
          <Label htmlFor="pg-price">Starting rent (₹ / month)</Label>
          <Input
            id="pg-price"
            inputMode="numeric"
            value={form.price}
            onChange={(event) =>
              set({ price: event.target.value.replace(/\D/g, "") })
            }
            placeholder="8500"
            className={inputStyle}
          />
        </div>
        <div className={fieldBox}>
          <Label htmlFor="pg-deposit">Security deposit (₹)</Label>
          <Input
            id="pg-deposit"
            inputMode="numeric"
            value={form.deposit}
            onChange={(event) =>
              set({ deposit: event.target.value.replace(/\D/g, "") })
            }
            placeholder="15000"
            className={inputStyle}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={fieldBox}>
          <Label htmlFor="pg-gender">Who it is for</Label>
          <Select
            value={form.gender || null}
            onValueChange={(value) =>
              set({ gender: (value as PgGender | null) ?? "" })
            }
          >
            <SelectTrigger id="pg-gender" className="h-11 w-full rounded-xl">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.keys(PG_GENDER_LABELS) as PgGender[]
              ).map((value) => (
                <SelectItem key={value} value={value}>
                  {PG_GENDER_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={fieldBox}>
          <Label htmlFor="pg-cooling">Cooling</Label>
          <Select
            value={form.cooling || null}
            onValueChange={(value) =>
              set({ cooling: (value as Cooling | null) ?? "" })
            }
          >
            <SelectTrigger id="pg-cooling" className="h-11 w-full rounded-xl">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(COOLING_LABELS) as Cooling[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {COOLING_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={fieldBox}>
        <Label htmlFor="pg-description">Description</Label>
        <Textarea
          id="pg-description"
          value={form.description}
          onChange={(event) => set({ description: event.target.value })}
          placeholder="What makes your PG a good place to live?"
          rows={4}
          maxLength={2000}
          className="rounded-xl"
        />
      </div>
    </EditorDialog>
  );
}
