import { create } from "zustand";
import { isFresh, markLoaded } from "@/stores/resource-cache";
import { ApiError } from "@/lib/api/client";
import { fetchPaymentsSummary, type PaymentsSummary } from "@/lib/api/payments";

export type EarningsPeriod = "month" | "year" | "all";

interface PaymentsState {
  summary: PaymentsSummary | null;
  period: EarningsPeriod;
  isLoading: boolean;
  /** True when the owner has no PG, which needs its own empty state. */
  hasNoPg: boolean;
  error: string | null;
  load: (force?: boolean) => Promise<void>;
  setPeriod: (period: EarningsPeriod) => Promise<void>;
}

const iso = (date: Date) => date.toISOString().slice(0, 10);

function rangeFor(period: EarningsPeriod): { from?: string; to?: string } {
  const now = new Date();

  if (period === "month") {
    return {
      from: iso(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: iso(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }

  if (period === "year") {
    return {
      from: iso(new Date(now.getFullYear(), 0, 1)),
      to: iso(new Date(now.getFullYear(), 11, 31)),
    };
  }

  // Far enough back to cover every payment recorded.
  return { from: "2000-01-01", to: iso(now) };
}

export const usePaymentsStore = create<PaymentsState>()((set, get) => ({
  summary: null,
  period: "month",
  isLoading: false,
  hasNoPg: false,
  error: null,

  load: async (force = false) => {
    if (get().isLoading) return;
    // Already loaded and still fresh: a route change should not refetch it.
    // Mutations below pass force, because they must see their own write.
    if (!force && isFresh("payments")) return;

    set({ isLoading: true, error: null });

    try {
      const summary = await fetchPaymentsSummary(rangeFor(get().period));
      set({ summary, isLoading: false, hasNoPg: false });
      markLoaded("payments");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        set({ isLoading: false, hasNoPg: true });
        markLoaded("payments");
        return;
      }

      set({
        isLoading: false,
        error:
          error instanceof ApiError
            ? error.message
            : "Could not load your earnings.",
      });
    }
  },

  setPeriod: async (period) => {
    set({ period });
    await get().load(true);
  },
}));
