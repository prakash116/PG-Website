import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { PersonalDetails } from "@/components/account/PersonalDetails";

export const metadata: Metadata = {
  title: "Personal details",
  description: "Your Pzee account details.",
};

export default function AccountPage() {
  return (
    <AccountShell
      title="Personal details"
      description="Keep your details current — your PG owner sees the name and number you keep here."
    >
      <PersonalDetails />
    </AccountShell>
  );
}
