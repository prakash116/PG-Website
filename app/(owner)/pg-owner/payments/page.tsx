import type { Metadata } from "next";
import { PaymentsSection } from "@/components/owner/sections/PaymentsSection";

export const metadata: Metadata = { title: "Payments" };

export default function PaymentsPage() {
  return <PaymentsSection />;
}
