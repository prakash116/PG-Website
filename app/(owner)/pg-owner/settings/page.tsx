import type { Metadata } from "next";
import { SettingsSection } from "@/components/owner/sections/SettingsSection";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SettingsSection />;
}
