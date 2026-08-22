import { create } from "zustand";
import { ApiError } from "@/lib/api/client";
import {
  fetchMyPg,
  replaceRooms,
  updateMyPg,
  type PgDetail,
  type RoomTypeInput,
  type UpdatePgPayload,
} from "@/lib/api/pg";

interface PgState {
  pg: PgDetail | null;
  isLoading: boolean;
  isSaving: boolean;
  /** True when the owner has no PG yet, which needs its own empty state. */
  hasNoPg: boolean;
  error: string | null;
  load: () => Promise<void>;
  saveDetails: (payload: UpdatePgPayload) => Promise<void>;
  saveRooms: (rooms: RoomTypeInput[]) => Promise<void>;
  clearError: () => void;
}

function messageFor(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export const usePgStore = create<PgState>()((set, get) => ({
  pg: null,
  isLoading: false,
  isSaving: false,
  hasNoPg: false,
  error: null,

  load: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });

    try {
      const response = await fetchMyPg();
      set({ pg: response.data, isLoading: false, hasNoPg: false });
    } catch (error: unknown) {
      // A 404 is not a failure: the account simply has no PG linked yet.
      if (error instanceof ApiError && error.status === 404) {
        set({ isLoading: false, hasNoPg: true, pg: null });
        return;
      }

      set({
        isLoading: false,
        error: messageFor(error, "Could not load your PG. Please try again."),
      });
    }
  },

  saveDetails: async (payload) => {
    set({ isSaving: true, error: null });

    try {
      const response = await updateMyPg(payload);
      set({ pg: response.data, isSaving: false });
    } catch (error: unknown) {
      const message = messageFor(error, "Could not save. Please try again.");
      set({ isSaving: false, error: message });
      throw new Error(message);
    }
  },

  saveRooms: async (rooms) => {
    set({ isSaving: true, error: null });

    try {
      const response = await replaceRooms(rooms);
      set({ pg: response.data, isSaving: false });
    } catch (error: unknown) {
      const message = messageFor(error, "Could not save rooms. Please try again.");
      set({ isSaving: false, error: message });
      throw new Error(message);
    }
  },


  clearError: () => set({ error: null }),
}));
