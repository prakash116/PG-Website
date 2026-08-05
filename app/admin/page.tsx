import type { Metadata } from "next";
import { RoleGate } from "@/components/auth/RoleGate";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Pzee administration dashboard.",
};

const ADMIN_METRICS = [
  {
    label: "Total users",
    value: "—",
    description: "Registered users across every account role.",
  },
  {
    label: "PG owners",
    value: "—",
    description: "Property owners currently registered on Pzee.",
  },
  {
    label: "Active properties",
    value: "—",
    description: "Verified properties visible to residents.",
  },
];

export default function AdminPage() {
  return (
    <RoleGate role="SUPER_ADMIN">
      <DashboardOverview
        eyebrow="Super Admin"
        title="Admin dashboard"
        description="Review the platform, users and property activity from one place."
        metrics={ADMIN_METRICS}
      />
    </RoleGate>
  );
}
