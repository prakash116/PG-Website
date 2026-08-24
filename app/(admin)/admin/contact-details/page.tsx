import type { Metadata } from "next";
import { PageHeader } from "@/components/owner/PageHeader";
import { ContactTable } from "@/components/admin/ContactTable";

export const metadata: Metadata = { title: "Contact Details" };

export default function AdminContactDetailsPage() {
  return (
    <>
      <PageHeader
        title="Contact Details"
        description="Messages sent from the Contact Us page. New ones come first."
      />
      <ContactTable />
    </>
  );
}
