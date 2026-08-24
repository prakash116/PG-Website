import type { Metadata } from "next";
import { AdminPreview } from "@/components/admin/AdminPreview";

export const metadata: Metadata = { title: "Analytics" };

export default function AdminAnalyticsPage() {
  return (
    <AdminPreview
      icon="analytics"
      title="Analytics"
      description="How Pzee is growing."
      planned={[
        "New PGs and residents joining each month",
        "Occupancy across every listing",
        "Revenue from listing fees and subscriptions",
      ]}
      needs="An admin analytics endpoint that aggregates across all PGs, not just one."
    />
  );
}
