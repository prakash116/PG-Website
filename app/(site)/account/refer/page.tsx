import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { ReferAFriend } from "@/components/account/ReferAFriend";

export const metadata: Metadata = {
  title: "Refer a friend",
  description: "Share your Pzee referral code and earn when a PG goes live.",
};

export default function AccountReferPage() {
  return (
    <AccountShell
      title="Refer a friend"
      description="Your code, and what it has earned you."
    >
      <ReferAFriend />
    </AccountShell>
  );
}
