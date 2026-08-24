import type { Metadata } from "next";
import { AdminPreview } from "@/components/admin/AdminPreview";

export const metadata: Metadata = { title: "Subscribe" };

export default function AdminSubscribePage() {
  return (
    <AdminPreview
      icon="subscribe"
      title="Subscribe"
      description="Plans owners can pay for."
      planned={[
        "Which plan each PG owner is on",
        "When each subscription renews or lapses",
        "Change or cancel a plan",
      ]}
      needs="A subscription model. Today the only charge is the one-off listing fee."
    />
  );
}
