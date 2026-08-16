"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Building2, MapPin, Search, Users, Wallet } from "lucide-react";
import { budgetRanges } from "@/data/budgets";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OCCUPANCY_OPTIONS = ["Single", "Double", "Triple"];
const PG_TYPE_OPTIONS = ["Boys", "Girls", "Co-Living"];

/** Borderless select styled to sit inside a search-panel field box. */
const innerSelectTrigger =
  "h-auto w-full border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:border-transparent text-sm font-medium text-foreground data-placeholder:text-muted-foreground/70";

export function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState<string | null>(null);
  const [occupancy, setOccupancy] = useState<string | null>(null);
  const [pgType, setPgType] = useState<string | null>(null);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!location.trim()) {
      toast.error("Please enter a city, area, college or office to search.");
      return;
    }
    toast("Finding the best PGs for you…", { icon: "🔍" });

    const params = new URLSearchParams({ location: location.trim() });
    if (budget) params.set("budget", budget);
    if (occupancy) params.set("occupancy", occupancy);
    if (pgType) params.set("gender", pgType);
    router.push(`/pg?${params.toString()}`);
  }

  return (
    <section
      id="smart-search"
      aria-label="Smart PG search"
      className="container-page relative z-20 -mt-16 scroll-mt-28 sm:-mt-20"
    >
      <motion.form
        onSubmit={handleSearch}
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border bg-card p-4 shadow-[0_24px_64px_rgb(38_22_10/0.14)] sm:p-5"
      >
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1.1fr_1fr_1fr_auto]">
          {/* Location */}
          <div className="flex items-center gap-3 rounded-2xl border bg-background px-4 py-3 transition-colors focus-within:border-primary/50">
            <MapPin className="size-5 shrink-0 text-brand-ink" />
            <div className="min-w-0 flex-1">
              <label
                htmlFor="search-location"
                className="block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
              >
                Location
              </label>
              <input
                id="search-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search city, area, college or office"
                autoComplete="off"
                className="w-full truncate bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="flex items-center gap-3 rounded-2xl border bg-background px-4 py-3">
            <Wallet className="size-5 shrink-0 text-brand-ink" />
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Monthly Budget
              </span>
              <Select
                value={budget}
                onValueChange={(value) => setBudget(value as string | null)}
              >
                <SelectTrigger
                  aria-label="Monthly budget"
                  className={innerSelectTrigger}
                >
                  <SelectValue placeholder="₹5,000 – ₹15,000" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((range) => (
                    <SelectItem
                      key={range.id}
                      value={`${range.min}-${range.max ?? ""}`}
                    >
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Occupancy */}
          <div className="flex items-center gap-3 rounded-2xl border bg-background px-4 py-3">
            <Users className="size-5 shrink-0 text-brand-ink" />
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Occupancy
              </span>
              <Select
                value={occupancy}
                onValueChange={(value) => setOccupancy(value as string | null)}
              >
                <SelectTrigger
                  aria-label="Occupancy"
                  className={innerSelectTrigger}
                >
                  <SelectValue placeholder="Any sharing" />
                </SelectTrigger>
                <SelectContent>
                  {OCCUPANCY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* PG type */}
          <div className="flex items-center gap-3 rounded-2xl border bg-background px-4 py-3">
            <Building2 className="size-5 shrink-0 text-brand-ink" />
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                PG Type
              </span>
              <Select
                value={pgType}
                onValueChange={(value) => setPgType(value as string | null)}
              >
                <SelectTrigger aria-label="PG type" className={innerSelectTrigger}>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  {PG_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="relative h-full min-h-13 gap-2.5 overflow-hidden rounded-2xl bg-linear-to-b from-saffron-500 to-saffron-600 px-8 text-base font-semibold tracking-tight shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_10px_22px_-8px_var(--saffron-700)] transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-0.5 hover:brightness-[1.06] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_16px_32px_-8px_var(--saffron-700)] lg:px-9"
          >
            {/* Light sweep on hover — decorative only. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent transition-[left] duration-700 ease-out group-hover/button:left-full"
            />
            <Search
              className="size-4.5 transition-transform duration-200 group-hover/button:scale-110"
              data-icon="inline-start"
            />
            Search PG
          </Button>
        </div>
      </motion.form>
    </section>
  );
}
