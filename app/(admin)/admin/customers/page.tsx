import type { Metadata } from "next";
import { PageHeader } from "@/components/owner/PageHeader";
import { UsersTable } from "@/components/admin/UsersTable";

export const metadata: Metadata = { title: "Customers" };

export default function AdminCustomersPage() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="Every account on Pzee. Deleting a customer keeps it restorable for 30 days."
      />
      {/* Already built and working — reused rather than rebuilt. */}
      <UsersTable />
    </>
  );
}
