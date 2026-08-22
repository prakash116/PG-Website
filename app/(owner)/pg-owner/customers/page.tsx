import type { Metadata } from "next";
import { CustomersSection } from "@/components/owner/sections/CustomersSection";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
  return <CustomersSection />;
}
