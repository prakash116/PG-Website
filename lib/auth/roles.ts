import type { UserRole } from "@/lib/api/auth";

export function getRoleDestination(role: UserRole): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/admin";
    case "PG_OWNER":
      return "/pg-owner/dashboard";
    case "USER":
      return "/";
  }
}
