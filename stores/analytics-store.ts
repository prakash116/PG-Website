import { create } from "zustand";
import { ApiError } from "@/lib/api/client";
import { fetchAnalytics, type AnalyticsSummary } from "@/lib/api/analytics";

interface AnalyticsState {
  data: AnalyticsSummary | null;
  isLoading: boolean;
  /** True when the owner has no PG, which needs its own empty state. */
  hasNoPg: boolean;
  error: string | null;
  load: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>()((set) => ({
  data: null,
  isLoading: false,
  hasNoPg: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });

    try {
      set({ data: await fetchAnalytics(), isLoading: false, hasNoPg: false });
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        set({ isLoading: false, hasNoPg: true });
        return;
      }

      set({
        isLoading: false,
        error:
          error instanceof ApiError
            ? error.message
            : "Could not load your analytics.",
      });
    }
  },
}));
