import type { Metadata } from "next";
import { AdminPreview } from "@/components/admin/AdminPreview";

export const metadata: Metadata = { title: "Setting" };

export default function AdminSettingsPage() {
  return (
    <AdminPreview
      icon="settings"
      title="Setting"
      description="Platform configuration."
      planned={[
        "The listing fee and referral reward amounts",
        "The UPI id owners pay into",
        "Which admins can confirm payments",
      ]}
      needs="Admin endpoints for values that live in the API environment today."
    />
  );
}
