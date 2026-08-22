import type { Metadata } from "next";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/owner/PageHeader";
import { PreviewSection } from "@/components/owner/PreviewSection";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="People who visited, rated or asked about your PG."
      />
      <PreviewSection
        icon={Users}
        planned={[
          "Visit requests, with date and contact details",
          "Ratings and written reviews residents left",
          "Questions sent to you, and their replies",
        ]}
        needs="Visit-request, review and enquiry tables, plus the rating feature that fills in the PG rating shown on your Overview."
      />
    </>
  );
}
