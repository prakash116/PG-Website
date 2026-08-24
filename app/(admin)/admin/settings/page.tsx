import type { Metadata } from "next";
import { PageHeader } from "@/components/owner/PageHeader";
import { MailSettingsForm } from "@/components/admin/MailSettingsForm";
import { SmsSettingsForm } from "@/components/admin/SmsSettingsForm";

export const metadata: Metadata = { title: "Setting" };

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader
        title="Setting"
        description="The email and SMS accounts Pzee sends verification codes from."
      />
      <div className="grid gap-8">
        <MailSettingsForm />
        <SmsSettingsForm />
      </div>
    </>
  );
}
