import type { Metadata } from "next";
import { ServicesSection } from "@/components/owner/sections/ServicesSection";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return <ServicesSection />;
}
