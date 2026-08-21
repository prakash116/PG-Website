"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Check, UtensilsCrossed } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AMENITY_OPTIONS, type PgDetail } from "@/lib/api/pg";
import { usePgStore } from "@/stores/pg-store";
import { EditorDialog } from "./EditorDialog";

interface PgAmenitiesFormProps {
  pg: PgDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PgAmenitiesForm({
  pg,
  open,
  onOpenChange,
}: PgAmenitiesFormProps) {
  const [amenities, setAmenities] = useState<string[]>(pg.amenities);
  const [foodIncluded, setFoodIncluded] = useState(pg.foodIncluded);
  const [foodDetails, setFoodDetails] = useState(pg.foodDetails ?? "");
  const isSaving = usePgStore((state) => state.isSaving);
  const saveDetails = usePgStore((state) => state.saveDetails);

  function toggle(amenity: string) {
    setAmenities((previous) =>
      previous.includes(amenity)
        ? previous.filter((entry) => entry !== amenity)
        : [...previous, amenity]
    );
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setAmenities(pg.amenities);
      setFoodIncluded(pg.foodIncluded);
      setFoodDetails(pg.foodDetails ?? "");
    }

    onOpenChange(next);
  }

  async function handleSave() {
    try {
      await saveDetails({
        amenities,
        foodIncluded,
        foodDetails: foodIncluded ? foodDetails.trim() : "",
      });
      toast.success("Amenities saved.");
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
    }
  }

  return (
    <EditorDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Amenities & food"
      description="What residents get included with their room."
      isSaving={isSaving}
      onSave={handleSave}
    >
      <fieldset>
        <legend className="mb-3 text-sm font-medium">Amenities</legend>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((amenity) => {
            const selected = amenities.includes(amenity);

            return (
              <button
                key={amenity}
                type="button"
                aria-pressed={selected}
                onClick={() => toggle(amenity)}
                className={cn(
                  "flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-all",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {selected && <Check className="size-3.5" strokeWidth={3} />}
                {amenity}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border bg-card p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <Checkbox
            checked={foodIncluded}
            onCheckedChange={(checked) => setFoodIncluded(checked === true)}
          />
          <span className="flex items-center gap-2 text-sm font-semibold">
            <UtensilsCrossed className="size-4 text-muted-foreground" />
            Meals are included in the rent
          </span>
        </label>

        {foodIncluded && (
          <div className="mt-4 space-y-2">
            <Label htmlFor="pg-food-details" className="text-xs text-muted-foreground">
              What is served
            </Label>
            <Textarea
              id="pg-food-details"
              value={foodDetails}
              onChange={(event) => setFoodDetails(event.target.value)}
              placeholder="Breakfast, lunch and dinner. Veg and egg daily."
              rows={3}
              maxLength={1000}
              className="rounded-xl"
            />
          </div>
        )}
      </fieldset>
    </EditorDialog>
  );
}
