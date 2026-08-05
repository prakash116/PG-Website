import type { Metadata } from "next";
import { RoleGate } from "@/components/auth/RoleGate";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

export const metadata: Metadata = {
  title: "PG Owner Dashboard",
  description: "Manage your Pzee properties and room availability.",
};

const OWNER_METRICS = [
  {
    label: "Properties",
    value: "—",
    description: "Properties connected to your owner account.",
  },
  {
    label: "Available rooms",
    value: "—",
    description: "Rooms currently available to residents.",
  },
  {
    label: "Visit requests",
    value: "—",
    description: "Pending requests from interested residents.",
  },
];

export default function PgOwnerDashboardPage() {
  return (
    <RoleGate role="PG_OWNER">
      <DashboardOverview
        eyebrow="PG Owner"
        title="Owner dashboard"
        description="Track your properties, room availability and resident interest."
        metrics={OWNER_METRICS}
      />
    </RoleGate>
  );
}
