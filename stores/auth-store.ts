import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ApiError } from "@/lib/api/client";
import {
  loginUser,
  registerUser,
  type AuthenticatedUser,
  type LoginPayload,
  type LoginResponse,
  type RegisterPayload,
  type RegisterResponse,
} from "@/lib/api/auth";

interface AuthState {
  isLoggingIn: boolean;
  isRegistering: boolean;
  accessToken: string | null;
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  registration: RegisterResponse | null;
  error: string | null;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => void;
  clearError: () => void;
  resetRegistration: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggingIn: false,
      isRegistering: false,
      accessToken: null,
      user: null,
      isAuthenticated: false,
      registration: null,
      error: null,

      login: async (payload) => {
        set({ isLoggingIn: true, error: null });

        try {
          const response = await loginUser(payload);
          set({
            isLoggingIn: false,
            accessToken: response.data.accessToken,
            user: response.data.user,
            isAuthenticated: true,
          });
          return response;
        } catch (error: unknown) {
          const message =
            error instanceof ApiError
              ? error.message
              : "Unable to connect to the login service. Please try again.";

          set({ isLoggingIn: false, error: message });
          throw new Error(message);
        }
      },

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

      logout: () =>
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          error: null,
        }),

      clearError: () => set({ error: null }),

      resetRegistration: () =>
        set({ isRegistering: false, registration: null, error: null }),
    }),
    {
      name: "pzzee-auth-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
