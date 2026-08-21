import type { Metadata } from "next";
import { RoleGate } from "@/components/auth/RoleGate";
import { OwnerDashboard } from "@/components/dashboard/pg/OwnerDashboard";

export const metadata: Metadata = {
  title: "PG Owner Dashboard",
  description: "Manage your Pzee property, rooms and room availability.",
};

export default function PgOwnerDashboardPage() {
  return (
    <RoleGate role="PG_OWNER">
      <div className="bg-secondary/40 px-4 pt-28 pb-20">
        <div className="mx-auto max-w-6xl">
          <OwnerDashboard />
        </div>
      </div>
    </RoleGate>
  );
}
