import type { Metadata } from "next";
import { AdminPreview } from "@/components/admin/AdminPreview";

export const metadata: Metadata = { title: "Customer Rating Details" };

export default function AdminRatingsPage() {
  return (
    <AdminPreview
      icon="ratings"
      title="Customer Rating Details"
      description="What residents say about their PG."
      planned={[
        "Every review, newest first",
        "Average rating per PG and how it moves",
        "Hide a review that breaks the rules",
      ]}
      needs="The ratings feature. Pg.rating and reviewCount exist but nothing writes to them yet."
    />
  );
}
