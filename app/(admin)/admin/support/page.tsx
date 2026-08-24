import type { Metadata } from "next";
import { PageHeader } from "@/components/owner/PageHeader";
import { SupportTable } from "@/components/admin/SupportTable";

export const metadata: Metadata = { title: "PG Support" };

export default function AdminSupportPage() {
  return (
    <>
      <PageHeader
        title="PG Support"
        description="Queries raised by PG owners. Open ones come first."
      />
      <SupportTable />
    </>
  );
}
