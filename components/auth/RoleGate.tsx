"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import type { UserRole } from "@/lib/api/auth";
import { getRoleDestination } from "@/lib/auth/roles";
import { useAuthStore } from "@/stores/auth-store";

interface RoleGateProps {
  role: UserRole;
  children: React.ReactNode;
}

export function RoleGate({ role, children }: RoleGateProps) {
  const router = useRouter();
  const isSessionResolved = useAuthStore((state) => state.isSessionResolved);
  const loadSession = useAuthStore((state) => state.loadSession);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!isSessionResolved) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (user.role !== role) {
      router.replace(getRoleDestination(user.role));
    }
  }, [isSessionResolved, isAuthenticated, role, router, user]);

  if (!isSessionResolved || !isAuthenticated || !user || user.role !== role) {
    return (
      <div className="flex min-h-[70svh] items-center justify-center pt-24">
        <LoaderCircle className="size-8 animate-spin text-brand-ink" />
        <span className="sr-only">Checking your account access</span>
      </div>
    );
  }

  return children;
}
