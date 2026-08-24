import type { Metadata } from "next";
import { AdminPreview } from "@/components/admin/AdminPreview";

export const metadata: Metadata = { title: "PG Support" };

export default function AdminSupportPage() {
  return (
    <AdminPreview
      icon="support"
      title="PG Support"
      description="Tickets raised by PG owners."
      planned={[
        "Open tickets with who raised them",
        "Replies in a thread, and who answered",
        "Close a ticket once it is resolved",
      ]}
      needs="A support ticket model and endpoints. None of it exists yet."
    />
  );
}
