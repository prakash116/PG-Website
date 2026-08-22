"use client";

import { Mail, Phone, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { usePgStore } from "@/stores/pg-store";
import { PageHeader } from "../PageHeader";

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="ml-auto truncate text-sm font-semibold">{value}</span>
    </div>
  );
}

export function SettingsSection() {
  const user = useAuthStore((state) => state.user);
  const pg = usePgStore((state) => state.pg);

  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : "—";

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your account details and listing status."
      />

      <div className="grid gap-5">
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-base font-bold">Account</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            These come from the account you registered with.
          </p>

          <div className="mt-4 divide-y">
            <Row icon={User} label="Name" value={fullName} />
            <Row icon={Mail} label="Email" value={user?.email ?? "—"} />
            <Row icon={Phone} label="Phone" value={user?.phone ?? "—"} />
          </div>

          <p className="mt-4 text-[13px] text-muted-foreground">
            Editing your account details is not built yet — the API has no
            endpoint for it. Ask support if something here is wrong.
          </p>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-base font-bold">Listing status</h2>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold",
                pg?.verified
                  ? "bg-success/15 text-success"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              <ShieldCheck className="size-4" />
              {pg?.verified ? "Verified" : "Pending review"}
            </span>

            {pg && (
              <span className="font-display text-sm font-extrabold tracking-wider text-brand-ink">
                {pg.pgCode}
              </span>
            )}
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
            A Pzee admin reviews new listings and marks them verified. You
            cannot change this yourself, which is what makes the badge worth
            something to residents.
          </p>
        </section>
      </div>
    </>
  );
}
