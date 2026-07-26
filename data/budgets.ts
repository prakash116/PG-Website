import type { BudgetRange } from "@/lib/types";

export const budgetRanges: BudgetRange[] = [
  { id: "b-1", label: "Under ₹5,000", min: 0, max: 5000 },
  { id: "b-2", label: "₹5,000 – ₹8,000", min: 5000, max: 8000 },
  { id: "b-3", label: "₹8,000 – ₹12,000", min: 8000, max: 12000 },
  { id: "b-4", label: "₹12,000 – ₹18,000", min: 12000, max: 18000 },
  { id: "b-5", label: "₹18,000+", min: 18000, max: null },
];

export const BUDGET_MIN = 2000;
export const BUDGET_MAX = 25000;
export const BUDGET_STEP = 500;
