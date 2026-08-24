import type { LucideIcon } from "lucide-react";
import { BedDouble, Gift, LayoutDashboard, UserRound } from "lucide-react";
import type { UserRole } from "@/lib/api/auth";
import { getRoleDestination } from "@/lib/auth/roles";

export interface AccountMenuItem {
  label: string;
  icon: LucideIcon;
  /** Absent while the feature behind it is still being built. */
  href?: string;
  /** Shown disabled, with a "Soon" pill, rather than doing nothing when clicked. */
  soon?: boolean;
}

/**
 * What the account menu offers, by role. Defined once because the header
 * renders it twice — a dropdown on desktop, a list on mobile — and two copies
 * of a list like this drift apart the first time one of them is edited.
 *
 * A resident manages themselves and their stay; an owner or an admin has a
 * dashboard for that, so their menu stays out of the way.
 */
export function getAccountMenu(role: UserRole): AccountMenuItem[] {
  if (role === "USER") {
    return [
      { label: "Personal details", href: "/account", icon: UserRound },
      { label: "My PG", href: "/account/stay", icon: BedDouble },
      { label: "Refer a friend", href: "/account/refer", icon: Gift },
    ];
  }

  return [
    {
      label: "Dashboard",
      // Reused so the Super Admin and the owner keep landing in the right
      // place, decided in one file rather than two.
      href: getRoleDestination(role),
      icon: LayoutDashboard,
    },
  ];
}
