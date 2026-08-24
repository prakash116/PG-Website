import type { Metadata } from "next";
import { PageHeader } from "@/components/owner/PageHeader";
import { ListingFees } from "@/components/admin/ListingFees";

export const metadata: Metadata = { title: "Payment" };

export default function AdminPaymentPage() {
  return (
    <>
      <PageHeader
        title="Payment"
        description="Listing fees waiting to be confirmed. Confirming one publishes the PG and credits its referrer."
      />
      {/* Already built and working — reused rather than rebuilt. */}
      <ListingFees />
    </>
  );
}
