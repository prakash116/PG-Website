import type { Metadata } from "next";
import { OverviewSection } from "@/components/owner/sections/OverviewSection";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  return <OverviewSection />;
}
