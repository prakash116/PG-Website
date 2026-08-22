import type { Metadata } from "next";
import { ChartNoAxesColumn } from "lucide-react";
import { PageHeader } from "@/components/owner/PageHeader";
import { PreviewSection } from "@/components/owner/PreviewSection";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="How your PG is performing over time."
      />
      <PreviewSection
        icon={ChartNoAxesColumn}
        planned={[
          "Occupancy rate, month by month",
          "Beds filled against beds free, per room type",
          "Earnings collected against what is due",
          "Residents joining and leaving over time",
        ]}
        needs="Occupancy history and the resident records from the CRM. Visitor and enquiry traffic would need event tracking, which does not exist yet."
      />
    </>
  );
}
