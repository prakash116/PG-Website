import type { Metadata } from "next";
import { AdminPreview } from "@/components/admin/AdminPreview";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default function AdminOverviewPage() {
  return (
    <AdminPreview
      icon="overview"
      title="Overview"
      description="The platform at a glance."
      planned={[
        "PGs, owners and residents on the platform",
        "Listings waiting to be published",
        "Fees collected and rewards owed this month",
      ]}
      needs="An admin summary endpoint. Customers and Payment already work — they are the two screens with a data source behind them."
    />
  );
}
