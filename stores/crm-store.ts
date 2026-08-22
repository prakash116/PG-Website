import { create } from "zustand";
import { ApiError } from "@/lib/api/client";
import {
  checkoutResident,
  createResident,
  deleteResident,
  fetchCrmSummary,
  fetchResidents,
  recordPayment,
  updateResident,
  type CreatePaymentPayload,
  type CreateResidentPayload,
  type CrmSummary,
  type Resident,
  type ResidentStatus,
  type UpdateResidentPayload,
} from "@/lib/api/crm";

/** The collection period the money tiles cover. */
export type CrmPeriod = "today" | "month" | "all";

interface CrmState {
  residents: Resident[];
  summary: CrmSummary | null;
  status: ResidentStatus;
  search: string;
  period: CrmPeriod;
  isLoading: boolean;
  isSaving: boolean;
  /** True when the owner has no PG, which needs its own empty state. */
  hasNoPg: boolean;
  error: string | null;
  load: () => Promise<void>;
  setStatus: (status: ResidentStatus) => Promise<void>;
  setSearch: (search: string) => Promise<void>;
  setPeriod: (period: CrmPeriod) => Promise<void>;
  addGuest: (payload: CreateResidentPayload) => Promise<void>;
  editGuest: (id: string, payload: UpdateResidentPayload) => Promise<void>;
  checkout: (id: string) => Promise<void>;
  removeGuest: (id: string) => Promise<void>;
  pay: (id: string, payload: CreatePaymentPayload) => Promise<void>;
  clearError: () => void;
}

const iso = (date: Date) => date.toISOString().slice(0, 10);

/** Turns the chosen period into the from/to the API expects. */
function rangeFor(period: CrmPeriod): { from?: string; to?: string } {
  const now = new Date();

  if (period === "today") {
    return { from: iso(now), to: iso(now) };
  }

  if (period === "month") {
    return {
      from: iso(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: iso(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }

  // "all" reaches back far enough to cover every payment recorded.
  return { from: "2000-01-01", to: iso(now) };
}

function messageFor(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export const useCrmStore = create<CrmState>()((set, get) => ({
  residents: [],
  summary: null,
  status: "ACTIVE",
  search: "",
  period: "month",
  isLoading: false,
  isSaving: false,
  hasNoPg: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });

    try {
      const { status, search, period } = get();
      const [residents, summary] = await Promise.all([
        fetchResidents({ status, search }),
        fetchCrmSummary(rangeFor(period)),
      ]);

      set({ residents, summary, isLoading: false, hasNoPg: false });
    } catch (error: unknown) {
      // A 404 means no PG is linked yet, which is a state rather than a failure.
      if (error instanceof ApiError && error.status === 404) {
        set({ isLoading: false, hasNoPg: true });
        return;
      }

      set({
        isLoading: false,
        error: messageFor(error, "Could not load your guests. Please try again."),
      });
    }
  },

  setStatus: async (status) => {
    set({ status });
    await get().load();
  },

  setSearch: async (search) => {
    set({ search });
    await get().load();
  },

  setPeriod: async (period) => {
    set({ period });
    await get().load();
  },

  addGuest: async (payload) => {
    await run(set, get, () => createResident(payload), "Could not add the guest.");
  },

  editGuest: async (id, payload) => {
    await run(set, get, () => updateResident(id, payload), "Could not save the guest.");
  },

  checkout: async (id) => {
    await run(set, get, () => checkoutResident(id), "Could not check the guest out.");
  },

  removeGuest: async (id) => {
    await run(set, get, () => deleteResident(id), "Could not delete the guest.");
  },

  pay: async (id, payload) => {
    await run(set, get, () => recordPayment(id, payload), "Could not record the payment.");
  },

  clearError: () => set({ error: null }),
}));

/**
 * Every write reloads the list and summary, because adding or checking out a
 * guest changes bed availability and the totals as well as the row itself.
 */
async function run(
  set: (partial: Partial<CrmState>) => void,
  get: () => CrmState,
  action: () => Promise<unknown>,
  fallback: string
): Promise<void> {
  set({ isSaving: true, error: null });

  try {
    await action();
    set({ isSaving: false });
    await get().load();
  } catch (error: unknown) {
    const message = messageFor(error, fallback);
    set({ isSaving: false, error: message });
    throw new Error(message);
  }
}
