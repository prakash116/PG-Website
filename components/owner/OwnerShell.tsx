"use client";

import { RoleGate } from "@/components/auth/RoleGate";
import { PzeeMark } from "@/components/common/Logo";
import type { UserRole } from "@/lib/api/auth";
import { OwnerHeader } from "./OwnerHeader";
import { OwnerSidebar } from "./OwnerSidebar";
import type { OwnerNavItem } from "./owner-nav";

interface OwnerShellProps {
  children: React.ReactNode;
  /** Who may see this dashboard. Defaults to the PG owner's. */
  role?: UserRole;
  /** Sidebar contents. Defaults to the PG owner's nav. */
  nav?: OwnerNavItem[];
  /** Shown under the name in the header. */
  subtitle?: string;
  drawerTitle?: string;
  drawerDescription?: string;
}

/**
 * Chrome for every dashboard screen: its own header and sidebar, deliberately
 * separate from the public site header. Wrapped in RoleGate so a signed-out
 * visitor, or someone with the wrong role, never reaches one.
 *
 * Every prop is optional and defaults to the PG owner's dashboard, which is
 * what it was built for. The Super Admin dashboard is the same shell with a
 * different role, nav and label — one set of chrome rather than two copies
 * that drift apart.
 */
export function OwnerShell({
  children,
  role = "PG_OWNER",
  nav,
  subtitle,
  drawerTitle,
  drawerDescription,
}: OwnerShellProps) {
  return (
    <RoleGate role={role}>
      <div className="min-h-svh bg-secondary/40">
        <OwnerHeader
          nav={nav}
          subtitle={subtitle}
          drawerTitle={drawerTitle}
          drawerDescription={drawerDescription}
        />

        <div className="flex">
          {/* Desktop sidebar; the mobile one lives in the header drawer. */}
          <aside className="sticky top-16 hidden h-[calc(100svh-4rem)] w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
            <div className="flex items-center gap-2.5 border-b px-4 py-4">
              <PzeeMark className="size-9" />
              <span className="font-display text-lg font-extrabold tracking-tight">
                Pzee
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <OwnerSidebar nav={nav} />
            </div>
          </aside>

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </RoleGate>
  );
}
