"use client";

import { OwnerShell } from "@/components/owner/OwnerShell";
import { ADMIN_NAV } from "./admin-nav";

/**
 * The Super Admin dashboard: the owner's chrome with a different role, nav and
 * label, rather than a second copy of the same header and sidebar.
 *
 * A client component on purpose. `ADMIN_NAV` holds lucide icons, which are
 * functions, and a server layout cannot pass those across into `OwnerShell`.
 * Importing the nav on this side of the boundary keeps the layout a plain
 * server component and leaves the pages free to export `metadata`.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <OwnerShell
      role="SUPER_ADMIN"
      nav={ADMIN_NAV}
      subtitle="Super Admin account"
      drawerTitle="Super Admin"
      drawerDescription="Manage the platform"
    >
      {children}
    </OwnerShell>
  );
}
