"use client";

import { MapPin, RotateCcw, Star } from "lucide-react";
import type { Gender, Occupancy } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { BUDGET_MAX, BUDGET_MIN, BUDGET_STEP } from "@/data/budgets";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

export interface ListingFilters {
  query: string;
  budget: [number, number];
  gender: Gender[];
  occupancy: Occupancy[];
  ac: "any" | "ac" | "non-ac";
  amenities: string[];
  verifiedOnly: boolean;
  minRating: number;
}

export const DEFAULT_FILTERS: ListingFilters = {
  query: "",
  budget: [BUDGET_MIN, BUDGET_MAX],
  gender: [],
  occupancy: [],
  ac: "any",
  amenities: [],
  verifiedOnly: false,
  minRating: 0,
};

export function countActiveFilters(f: ListingFilters): number {
  let count = 0;
  if (f.query.trim()) count++;
  if (f.budget[0] !== BUDGET_MIN || f.budget[1] !== BUDGET_MAX) count++;
  count += f.gender.length + f.occupancy.length + f.amenities.length;
  if (f.ac !== "any") count++;
  if (f.verifiedOnly) count++;
  if (f.minRating > 0) count++;
  return count;
}

const GENDERS: Gender[] = ["Boys", "Girls", "Co-Living"];
const OCCUPANCIES: Occupancy[] = ["Single", "Double", "Triple"];
const AMENITY_FILTERS = ["Food", "WiFi", "Laundry", "Parking"];
const AMENITY_LABELS: Record<string, string> = {
  Food: "Food Included",
  WiFi: "WiFi",
  Laundry: "Laundry",
  Parking: "Parking",
};
const RATING_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
  { label: "4.5+", value: 4.5 },
];

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

interface PGFiltersProps {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
  className?: string;
}

export function PGFilters({ filters, onChange, className }: PGFiltersProps) {
  const set = (patch: Partial<ListingFilters>) =>
    onChange({ ...filters, ...patch });

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="h-8 gap-1.5 rounded-full text-xs text-muted-foreground"
        >
          <RotateCcw className="size-3" />
          Clear all
        </Button>
      </div>

      {/* Location */}
      <div className="space-y-2.5">
        <Label htmlFor="filter-location" className="text-sm font-semibold">
          Location
        </Label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="filter-location"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
            placeholder="City, area or PG name"
            className="h-11 rounded-xl pl-10"
          />
        </div>
      </div>

      <Separator />

      {/* Budget */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Monthly Budget</Label>
          <span className="text-xs font-medium text-muted-foreground">
            {formatINR(filters.budget[0])} – {formatINR(filters.budget[1])}
          </span>
        </div>
        <Slider
          value={filters.budget}
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={BUDGET_STEP}
          onValueChange={(value) => {
            if (Array.isArray(value) && value.length === 2) {
              set({ budget: [value[0], value[1]] });
            }
          }}
          aria-label="Monthly budget range"
        />
      </div>

      <Separator />

      {/* PG type */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">PG Type</legend>
        {GENDERS.map((gender) => (
          <div key={gender} className="flex items-center gap-2.5">
            <Checkbox
              id={`filter-gender-${gender}`}
              checked={filters.gender.includes(gender)}
              onCheckedChange={() => set({ gender: toggle(filters.gender, gender) })}
            />
            <Label
              htmlFor={`filter-gender-${gender}`}
              className="text-sm font-normal text-foreground"
            >
              {gender}
            </Label>
          </div>
        ))}
      </fieldset>

      <Separator />

      {/* Occupancy */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Room Type</legend>
        {OCCUPANCIES.map((occ) => (
          <div key={occ} className="flex items-center gap-2.5">
            <Checkbox
              id={`filter-occ-${occ}`}
              checked={filters.occupancy.includes(occ)}
              onCheckedChange={() =>
                set({ occupancy: toggle(filters.occupancy, occ) })
              }
            />
            <Label
              htmlFor={`filter-occ-${occ}`}
              className="text-sm font-normal text-foreground"
            >
              {occ === "Single" ? "Single Room" : `${occ} Sharing`}
            </Label>
          </div>
        ))}
      </fieldset>

      <Separator />

      {/* AC */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Cooling</Label>
        <div className="flex gap-2">
          {(
            [
              { label: "Any", value: "any" },
              { label: "AC", value: "ac" },
              { label: "Non-AC", value: "non-ac" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set({ ac: opt.value })}
              aria-pressed={filters.ac === opt.value}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                filters.ac === opt.value
                  ? "border-saffron-600 bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Amenities */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Amenities</legend>
        {AMENITY_FILTERS.map((amenity) => (
          <div key={amenity} className="flex items-center gap-2.5">
            <Checkbox
              id={`filter-amenity-${amenity}`}
              checked={filters.amenities.includes(amenity)}
              onCheckedChange={() =>
                set({ amenities: toggle(filters.amenities, amenity) })
              }
            />
            <Label
              htmlFor={`filter-amenity-${amenity}`}
              className="text-sm font-normal text-foreground"
            >
              {AMENITY_LABELS[amenity]}
            </Label>
          </div>
        ))}
      </fieldset>

      <Separator />

      {/* Verified + rating */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="filter-verified"
            checked={filters.verifiedOnly}
            onCheckedChange={() => set({ verifiedOnly: !filters.verifiedOnly })}
          />
          <Label
            htmlFor="filter-verified"
            className="text-sm font-normal text-foreground"
          >
            Pzzee Verified only
          </Label>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Minimum Rating</Label>
        <div className="flex gap-2">
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set({ minRating: opt.value })}
              aria-pressed={filters.minRating === opt.value}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                filters.minRating === opt.value
                  ? "border-saffron-600 bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {opt.value > 0 && <Star className="size-3 fill-current" />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
