"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import type { PG } from "@/lib/types";
import type { Gender, Occupancy } from "@/lib/types";
import { pgs } from "@/data/pg";
import { BUDGET_MAX, BUDGET_MIN } from "@/data/budgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { EmptyState } from "@/components/common/EmptyState";
import { PGCardSkeleton } from "@/components/pg/PGCard";
import { PGGrid } from "@/components/pg/PGGrid";
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  PGFilters,
  type ListingFilters,
} from "@/components/pg/PGFilters";

type SortOption = "recommended" | "price-asc" | "price-desc" | "rating";

const SORT_LABELS: Record<SortOption, string> = {
  recommended: "Recommended",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Highest Rated",
};

const GENDERS: Gender[] = ["Boys", "Girls", "Co-Living"];
const OCCUPANCIES: Occupancy[] = ["Single", "Double", "Triple"];

function applyFilters(list: PG[], f: ListingFilters): PG[] {
  const query = f.query.trim().toLowerCase();
  return list.filter((pg) => {
    if (query) {
      const haystack =
        `${pg.name} ${pg.location} ${pg.city} ${pg.nearby.join(" ")}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (pg.price < f.budget[0] || pg.price > f.budget[1]) return false;
    if (f.gender.length > 0 && !f.gender.includes(pg.gender)) return false;
    if (
      f.occupancy.length > 0 &&
      !pg.roomTypes.some((room) => f.occupancy.includes(room.type))
    ) {
      return false;
    }
    if (f.ac === "ac" && !pg.amenities.includes("AC")) return false;
    if (f.ac === "non-ac" && pg.amenities.includes("AC")) return false;
    if (f.amenities.some((a) => !pg.amenities.includes(a))) return false;
    if (f.verifiedOnly && !pg.verified) return false;
    if (pg.rating < f.minRating) return false;
    return true;
  });
}

function sortPGs(list: PG[], sort: SortOption): PG[] {
  const sorted = [...list];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    default:
      return sorted.sort(
        (a, b) =>
          Number(b.verified) - Number(a.verified) || b.rating - a.rating
      );
  }
}

/** Builds initial filters from URL params set by the homepage smart search. */
function filtersFromParams(params: URLSearchParams): ListingFilters {
  const filters: ListingFilters = { ...DEFAULT_FILTERS };

  const location = params.get("location");
  if (location) filters.query = location;

  const budget = params.get("budget");
  if (budget) {
    const [minRaw, maxRaw] = budget.split("-");
    const min = Number(minRaw);
    const max = Number(maxRaw);
    filters.budget = [
      Number.isFinite(min) && min > 0 ? Math.max(min, BUDGET_MIN) : BUDGET_MIN,
      Number.isFinite(max) && max > 0 ? Math.min(max, BUDGET_MAX) : BUDGET_MAX,
    ];
  }

  const gender = params.get("gender");
  if (gender && GENDERS.includes(gender as Gender)) {
    filters.gender = [gender as Gender];
  }

  const occupancy = params.get("occupancy");
  if (occupancy && OCCUPANCIES.includes(occupancy as Occupancy)) {
    filters.occupancy = [occupancy as Occupancy];
  }

  if (params.get("verified") === "1") filters.verifiedOnly = true;

  return filters;
}

export function PGListing() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ListingFilters>(() =>
    filtersFromParams(new URLSearchParams(searchParams.toString()))
  );
  const [sort, setSort] = useState<SortOption>("recommended");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const firstRender = useRef(true);

  // Brief skeleton state when filters/sort change, mimicking a real fetch.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [filters, sort]);

  const results = useMemo(
    () => sortPGs(applyFilters(pgs, filters), sort),
    [filters, sort]
  );

  const activeCount = countActiveFilters(filters);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-3xl border bg-card p-6">
          <PGFilters filters={filters} onChange={setFilters} />
        </div>
      </aside>

      <div>
        {/* Top controls */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              placeholder="Search city, area, college or PG name"
              aria-label="Search PGs"
              className="h-13 rounded-2xl border-border bg-card pl-11 text-[15px] shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">
              {loading ? "Searching…" : `${results.length} PGs Found`}
              {!loading && activeCount > 0 && (
                <span className="ml-2 font-normal text-muted-foreground">
                  · {activeCount} filter{activeCount > 1 ? "s" : ""} applied
                </span>
              )}
            </p>

            <div className="flex items-center gap-2.5">
              {/* Mobile filter trigger */}
              <Button
                variant="outline"
                onClick={() => setSheetOpen(true)}
                className="h-10 gap-2 rounded-full px-4 lg:hidden"
              >
                <SlidersHorizontal className="size-4" />
                Filters
                {activeCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {activeCount}
                  </span>
                )}
              </Button>

              <Select
                value={sort}
                onValueChange={(value) => {
                  if (value) setSort(value as SortOption);
                }}
              >
                <SelectTrigger
                  aria-label="Sort results"
                  className="h-10 min-w-44 rounded-full bg-card px-4"
                >
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                    <SelectItem key={option} value={option}>
                      {SORT_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PGCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <PGGrid pgs={results} columns={3} />
        ) : (
          <EmptyState
            title="No PGs match your filters"
            description="Try widening your budget range or removing a few filters — new properties are added every week."
            actionLabel="Clear all filters"
            onAction={() => setFilters(DEFAULT_FILTERS)}
          />
        )}
      </div>

      {/* Mobile filters drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-[88%] max-w-sm overflow-y-auto">
          <SheetHeader className="border-b">
            <SheetTitle>Refine your search</SheetTitle>
            <SheetDescription>
              Narrow results by budget, room type and amenities.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <PGFilters filters={filters} onChange={setFilters} />
          </div>
          <div className="sticky bottom-0 border-t bg-background p-4">
            <Button
              onClick={() => setSheetOpen(false)}
              className="h-12 w-full rounded-full font-semibold"
            >
              Show {results.length} PGs
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
