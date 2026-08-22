import type { Metadata } from "next";
import { CrmSection } from "@/components/owner/sections/CrmSection";

export const metadata: Metadata = { title: "CRM" };

export default function CrmPage() {
  return <CrmSection />;
}
