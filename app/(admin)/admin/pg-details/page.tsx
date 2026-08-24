import type { Metadata } from "next";
import { AdminPreview } from "@/components/admin/AdminPreview";

export const metadata: Metadata = { title: "PG Details" };

export default function AdminPgDetailsPage() {
  return (
    <AdminPreview
      icon="pg"
      title="PG Details"
      description="Every listing on the platform."
      planned={[
        "Every PG with its owner, city and room count",
        "Published or private, and who verified it",
        "Open one listing to see and edit its details",
      ]}
      needs="An admin listing endpoint. The owner-facing one only ever returns your own PG."
    />
  );
}
