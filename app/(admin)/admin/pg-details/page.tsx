import type { Metadata } from "next";
import { PageHeader } from "@/components/owner/PageHeader";
import { PgDetailsTable } from "@/components/admin/PgDetailsTable";

export const metadata: Metadata = { title: "PG Details" };

export default function AdminPgDetailsPage() {
  return (
    <>
      <PageHeader
        title="PG Details"
        description="Every listing on Pzee. Open one to see its rooms, guests and revenue."
      />
      <PgDetailsTable />
    </>
  );
}
