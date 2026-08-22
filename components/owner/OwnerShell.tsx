"use client";

import { RoleGate } from "@/components/auth/RoleGate";
import { PzeeMark } from "@/components/common/Logo";
import { OwnerHeader } from "./OwnerHeader";
import { OwnerSidebar } from "./OwnerSidebar";

/**
 * Chrome for every PG owner screen: its own header and sidebar, deliberately
 * separate from the public site header. Wrapped in RoleGate so a signed-out
 * visitor or a resident never reaches an owner page.
 */
export function OwnerShell({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate role="PG_OWNER">
      <div className="min-h-svh bg-secondary/40">
        <OwnerHeader />

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
              <OwnerSidebar />
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
