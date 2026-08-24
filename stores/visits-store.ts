import { create } from "zustand";
import { isFresh, markLoaded } from "@/stores/resource-cache";
import { ApiError } from "@/lib/api/client";
import {
  fetchOwnerVisits,
  updateVisitStatus,
  type Visit,
  type VisitStatus,
} from "@/lib/api/visits";

export type VisitFilter = VisitStatus | "ALL";

interface VisitsState {
  visits: Visit[];
  filter: VisitFilter;
  isLoading: boolean;
  /** The request currently being acted on, so only its buttons disable. */
  pendingId: string | null;
  /** True when the owner has no PG, which needs its own empty state. */
  hasNoPg: boolean;
  error: string | null;
  load: (force?: boolean) => Promise<void>;
  setFilter: (filter: VisitFilter) => Promise<void>;
  setStatus: (id: string, status: VisitStatus) => Promise<void>;
}

export const useVisitsStore = create<VisitsState>()((set, get) => ({
  visits: [],
  filter: "ALL",
  isLoading: false,
  pendingId: null,
  hasNoPg: false,
  error: null,

  load: async (force = false) => {
    if (get().isLoading) return;
    // Already loaded and still fresh: a route change should not refetch it.
    // Mutations below pass force, because they must see their own write.
    if (!force && isFresh("visits")) return;

    set({ isLoading: true, error: null });

    try {
      const { filter } = get();
      const visits = await fetchOwnerVisits(
        filter === "ALL" ? undefined : filter
      );

      set({ visits, isLoading: false, hasNoPg: false });
      markLoaded("visits");
    } catch (error: unknown) {
      // A 404 means no PG is linked yet, which is a state rather than a failure.
      if (error instanceof ApiError && error.status === 404) {
        set({ isLoading: false, hasNoPg: true });
        markLoaded("visits");
        return;
      }

      set({
        isLoading: false,
        error:
          error instanceof ApiError
            ? error.message
            : "Could not load your visit requests.",
      });
    }
  },

  setFilter: async (filter) => {
    set({ filter });
    await get().load(true);
  },

  setStatus: async (id, status) => {
    set({ pendingId: id, error: null });

    try {
      await updateVisitStatus(id, status);
      set({ pendingId: null });
      // Reload, because a status change can move the row out of the filter.
      await get().load(true);
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Could not update the request.";

      set({ pendingId: null, error: message });
      throw new Error(message);
    }
  },
}));
