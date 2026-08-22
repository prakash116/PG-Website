import type { Metadata } from "next";
import { PgInfoSection } from "@/components/owner/sections/PgInfoSection";

export const metadata: Metadata = { title: "PG Info" };

export default function Page() {
  return <PgInfoSection />;
}
