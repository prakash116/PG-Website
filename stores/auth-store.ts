import { create } from "zustand";
import { ApiError } from "@/lib/api/client";
import {
  registerUser,
  type RegisterPayload,
  type RegisterResponse,
} from "@/lib/api/auth";

interface AuthState {
  isRegistering: boolean;
  registration: RegisterResponse | null;
  error: string | null;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  clearError: () => void;
  resetRegistration: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  isRegistering: false,
  registration: null,
  error: null,

  register: async (payload) => {
    set({ isRegistering: true, registration: null, error: null });

    try {
      const registration = await registerUser(payload);
      set({ isRegistering: false, registration });
      return registration;
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to connect to the registration service. Please try again.";

      set({ isRegistering: false, error: message });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),

  resetRegistration: () =>
    set({ isRegistering: false, registration: null, error: null }),
}));
