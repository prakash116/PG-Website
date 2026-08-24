import type { Metadata } from "next";
import { RoleGate } from "@/components/auth/RoleGate";
import { ListingFees } from "@/components/admin/ListingFees";
import { UsersTable } from "@/components/admin/UsersTable";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Pzee administration dashboard.",
};

export default function AdminPage() {
  return (
    <RoleGate role="SUPER_ADMIN">
      <section className="container-page pt-28 pb-20 sm:pt-32">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-brand-ink uppercase">
            Super Admin
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Admin dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Every account on Pzee. Deleting a customer closes their account and
            keeps it restorable for 30 days.
          </p>
        </header>

        <div className="mt-8 grid gap-6">
          <ListingFees />
          <UsersTable />
        </div>
      </section>
    </RoleGate>
  );
}
