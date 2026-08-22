import type { Metadata } from "next";
import { AnalyticsSection } from "@/components/owner/sections/AnalyticsSection";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return <AnalyticsSection />;
}
