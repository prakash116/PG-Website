import { create } from "zustand";
import { ApiError } from "@/lib/api/client";
import {
  fetchSession,
  loginUser,
  logoutUser,
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
  isLoggingOut: boolean;
  /** False until the session cookie has been checked once on load. */
  isSessionResolved: boolean;
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  registration: RegisterResponse | null;
  error: string | null;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  loadSession: () => Promise<void>;
  /**
   * Replaces the signed-in user after they edit their own account, so the
   * header shows the new name straight away. `loadSession` cannot do this: it
   * returns early once the session has been resolved.
   */
  setUser: (user: AuthenticatedUser) => void;
  logout: () => Promise<void>;
  clearError: () => void;
  resetRegistration: () => void;
}

// Shared so a page with several mounted consumers only checks the session once.
let sessionRequest: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()((set, get) => ({
  isLoggingIn: false,
  isRegistering: false,
  isLoggingOut: false,
  isSessionResolved: false,
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
        user: response.data.user,
        isAuthenticated: true,
        isSessionResolved: true,
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
      const registered = registration.data;

      // The API issues the session cookie on register, so the new account is
      // already signed in. Mirror that here instead of making them log in.
      set({
        isRegistering: false,
        registration,
        user: {
          id: registered.id,
          firstName: registered.firstName,
          lastName: registered.lastName,
          email: registered.email,
          phone: registered.phone,
          role: registered.role,
          userType: registered.userType,
          profileImage: registered.profileImage,
          lastLogin: null,
        },
        isAuthenticated: true,
        isSessionResolved: true,
      });

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

  loadSession: async () => {
    if (get().isSessionResolved) return;
    if (sessionRequest) return sessionRequest;

    sessionRequest = (async () => {
      try {
        const session = await fetchSession();
        set({
          user: session.data,
          isAuthenticated: true,
          isSessionResolved: true,
        });
      } catch {
        // No cookie, or it expired: the visitor is simply signed out.
        set({ user: null, isAuthenticated: false, isSessionResolved: true });
      } finally {
        sessionRequest = null;
      }
    })();

    return sessionRequest;
  },

  setUser: (user) =>
    set({ user, isAuthenticated: true, isSessionResolved: true }),

  logout: async () => {
    set({ isLoggingOut: true });

    try {
      await logoutUser();
    } catch {
      // The cookie may already be gone; sign out locally either way.
    }

    set({
      isLoggingOut: false,
      user: null,
      isAuthenticated: false,
      isSessionResolved: true,
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  resetRegistration: () =>
    set({ isRegistering: false, registration: null, error: null }),
}));
