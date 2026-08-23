"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import type { UserRole } from "@/lib/api/auth";
import { getRoleDestination } from "@/lib/auth/roles";
import { useAuthStore } from "@/stores/auth-store";

interface RoleGateProps {
  /**
   * Which roles may see this. Omit it to mean "any signed-in account", which is
   * what the account pages want: an owner has an account too, and sending them
   * to their dashboard for asking about their own profile would be wrong.
   */
  role?: UserRole | UserRole[];
  children: React.ReactNode;
}

export function RoleGate({ role, children }: RoleGateProps) {
  const router = useRouter();
  const isSessionResolved = useAuthStore((state) => state.isSessionResolved);
  const loadSession = useAuthStore((state) => state.loadSession);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // A string, not an array: an inline `role={["A", "B"]}` prop is a new array
  // on every render and would re-run the effect below forever.
  const allowed = role === undefined ? "" : [role].flat().join(",");
  const isAllowed = user !== null && (allowed === "" || allowed.split(",").includes(user.role));

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!isSessionResolved) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (allowed !== "" && !allowed.split(",").includes(user.role)) {
      router.replace(getRoleDestination(user.role));
    }
  }, [allowed, isSessionResolved, isAuthenticated, router, user]);

  if (!isSessionResolved || !isAuthenticated || !user || !isAllowed) {
    return (
      <div className="flex min-h-[70svh] items-center justify-center pt-24">
        <LoaderCircle className="size-8 animate-spin text-brand-ink" />
        <span className="sr-only">Checking your account access</span>
      </div>
    );
  }

  return children;
}
