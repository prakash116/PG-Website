import type { Metadata } from "next";
import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/owner/PageHeader";
import { PreviewSection } from "@/components/owner/PreviewSection";

export const metadata: Metadata = { title: "Payments" };

export default function PaymentsPage() {
  return (
    <>
      <PageHeader
        title="Payments"
        description="Take rent online and track what reaches your account."
      />
      <PreviewSection
        icon={CreditCard}
        planned={[
          "Connect a payment gateway account",
          "Rent collected online, per resident",
          "Payouts to your bank account",
          "Receipts and refunds",
        ]}
        needs="A payment provider account and its keys, plus a webhook endpoint to record what actually settles. Nothing here should be built on guesses about money."
      />
    </>
  );
}
