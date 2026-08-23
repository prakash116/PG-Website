import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { MyStay } from "@/components/account/MyStay";

export const metadata: Metadata = {
  title: "My PG",
  description: "The PG you are currently staying in.",
};

export default function AccountStayPage() {
  return (
    <AccountShell
      title="My PG"
      description="Your room, what you pay each month, and who to call."
    >
      <MyStay />
    </AccountShell>
  );
}
