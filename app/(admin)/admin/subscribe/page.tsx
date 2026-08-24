import type { Metadata } from "next";
import { PageHeader } from "@/components/owner/PageHeader";
import { SubscribersTable } from "@/components/admin/SubscribersTable";

export const metadata: Metadata = { title: "Subscribe" };

export default function AdminSubscribePage() {
  return (
    <>
      <PageHeader
        title="Subscribe"
        description="Everyone who asked for PG updates from the site footer."
      />
      <SubscribersTable />
    </>
  );
}
