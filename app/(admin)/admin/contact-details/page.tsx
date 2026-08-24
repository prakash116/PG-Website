import type { Metadata } from "next";
import { AdminPreview } from "@/components/admin/AdminPreview";

export const metadata: Metadata = { title: "Contact Details" };

export default function AdminContactDetailsPage() {
  return (
    <AdminPreview
      icon="contact"
      title="Contact Details"
      description="Enquiries that came in from the website."
      planned={[
        "Messages sent from the contact form",
        "Who replied and when",
        "Mark an enquiry as handled",
      ]}
      needs="A contact form that stores what it receives — today it sends nothing to the API."
    />
  );
}
