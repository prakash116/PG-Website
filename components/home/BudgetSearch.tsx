"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Wallet } from "lucide-react";
import { budgetRanges, BUDGET_MAX, BUDGET_MIN, BUDGET_STEP } from "@/data/budgets";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AnimatedSection } from "@/components/common/AnimatedSection";

export function BudgetSearch() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [range, setRange] = useState<[number, number]>([4000, 12000]);
  const [sliderTouched, setSliderTouched] = useState(false);

  const selected = budgetRanges.find((b) => b.id === selectedId) ?? null;

  function selectCard(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
    setSliderTouched(false);
  }

  function explore() {
    const min = selected ? selected.min : range[0];
    const max = selected ? selected.max : range[1];
    router.push(`/pg?budget=${min}-${max ?? ""}`);
  }

  const showCTA = selectedId !== null || sliderTouched;

  return (
    <section
      id="budget"
      className="relative scroll-mt-24 overflow-hidden bg-[oklch(0.24_0.09_277)] py-20 text-white sm:py-24"
    >
      {/* Texture */}
      <div className="bg-dot-pattern absolute inset-0 text-white/40 opacity-20" aria-hidden="true" />
      <div
        className="absolute -top-40 -right-40 size-[480px] rounded-full bg-primary/40 blur-[140px]"
        aria-hidden="true"
      />

      <div className="container-page relative">
        <SectionHeader
          eyebrow="Budget-first search"
          title="Find a PG That Fits Your Budget"
          subtitle="Good living doesn't have to stretch your wallet."
          tone="light"
          align="center"
        />

        <AnimatedSection>
          <div
            role="group"
            aria-label="Choose a budget range"
            className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3"
          >
            {budgetRanges.map((budget) => {
              const active = selectedId === budget.id;
              return (
                <motion.button
                  key={budget.id}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectCard(budget.id)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-2xl border px-6 py-4 font-display text-sm font-bold transition-all duration-200 sm:text-base",
                    active
                      ? "border-white bg-white text-[oklch(0.24_0.09_277)] shadow-xl shadow-black/20"
                      : "border-white/20 bg-white/5 text-white/85 hover:border-white/50 hover:bg-white/10"
                  )}
                >
                  {budget.label}
                </motion.button>
              );
            })}
          </div>
        </AnimatedSection>

        {/* Fine-tune slider */}
        <AnimatedSection delay={0.1} className="mx-auto mt-12 max-w-xl">
          <div className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <Wallet className="size-4" />
                Or fine-tune your range
              </p>
              <p className="font-display text-sm font-bold text-white">
                {formatINR(range[0])} – {formatINR(range[1])}
              </p>
            </div>
            <Slider
              value={range}
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              onValueChange={(value) => {
                if (Array.isArray(value) && value.length === 2) {
                  setRange([value[0], value[1]]);
                  setSelectedId(null);
                  setSliderTouched(true);
                }
              }}
              aria-label="Custom budget range"
              className="**:data-[slot=slider-track]:bg-white/20"
            />
            <div className="mt-2.5 flex justify-between text-xs text-white/50">
              <span>{formatINR(BUDGET_MIN)}</span>
              <span>{formatINR(BUDGET_MAX)}+</span>
            </div>
          </div>
        </AnimatedSection>

        <div className="mt-8 flex min-h-14 justify-center">
          <AnimatePresence>
            {showCTA && (
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={explore}
                  className="h-13 rounded-full bg-white px-8 text-base font-bold text-[oklch(0.24_0.09_277)] shadow-xl shadow-black/25 hover:bg-white/90"
                >
                  Explore PGs{" "}
                  {selected
                    ? selected.label.startsWith("Under") ||
                      selected.label.endsWith("+")
                      ? selected.label.toLowerCase()
                      : `in ${selected.label}`
                    : `in ${formatINR(range[0])} – ${formatINR(range[1])}`}
                  <ArrowRight className="size-4.5" data-icon="inline-end" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
