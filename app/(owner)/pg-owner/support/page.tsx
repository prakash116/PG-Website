import type { Metadata } from "next";
import { SupportSection } from "@/components/owner/sections/SupportSection";

export const metadata: Metadata = { title: "PG Support" };

export default function OwnerSupportPage() {
  return <SupportSection />;
}
