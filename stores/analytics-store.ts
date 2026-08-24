import { create } from "zustand";
import { isFresh, markLoaded } from "@/stores/resource-cache";
import { ApiError } from "@/lib/api/client";
import { fetchAnalytics, type AnalyticsSummary } from "@/lib/api/analytics";

interface AnalyticsState {
  data: AnalyticsSummary | null;
  isLoading: boolean;
  /** True when the owner has no PG, which needs its own empty state. */
  hasNoPg: boolean;
  error: string | null;
  load: (force?: boolean) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>()((set, get) => ({
  data: null,
  isLoading: false,
  hasNoPg: false,
  error: null,

  load: async (force = false) => {
    if (get().isLoading) return;
    // Already loaded and still fresh: a route change should not refetch it.
    // Mutations below pass force, because they must see their own write.
    if (!force && isFresh("analytics")) return;

    set({ isLoading: true, error: null });

    try {
      set({ data: await fetchAnalytics(), isLoading: false, hasNoPg: false });
      markLoaded("analytics");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        set({ isLoading: false, hasNoPg: true });
        markLoaded("analytics");
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
