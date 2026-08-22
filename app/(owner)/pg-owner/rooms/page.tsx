import type { Metadata } from "next";
import { RoomsSection } from "@/components/owner/sections/RoomsSection";

export const metadata: Metadata = { title: "Room management" };

export default function Page() {
  return <RoomsSection />;
}
