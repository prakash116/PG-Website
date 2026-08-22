import type { Metadata } from "next";
import { UsersRound } from "lucide-react";
import { PageHeader } from "@/components/owner/PageHeader";
import { PreviewSection } from "@/components/owner/PreviewSection";

export const metadata: Metadata = { title: "CRM" };

export default function CrmPage() {
  return (
    <>
      <PageHeader
        title="CRM"
        description="Your guests, what they owe, and what you have collected."
      />
      <PreviewSection
        icon={UsersRound}
        planned={[
          "Total guests staying right now",
          "Pending amount, per guest and in total",
          "Total collection, filtered by day or month",
          "Who joined, who left, and when",
        ]}
        needs="A Resident table linking each guest to a room type, rent and payment record. Once it exists, free beds are worked out from who is staying instead of being typed in by hand."
      />
    </>
  );
}
