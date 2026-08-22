import { OwnerShell } from "@/components/owner/OwnerShell";

export default function OwnerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <OwnerShell>{children}</OwnerShell>;
}
