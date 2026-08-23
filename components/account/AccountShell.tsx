"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGate } from "@/components/auth/RoleGate";
import { getAccountMenu } from "@/lib/auth/account-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

interface AccountShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

/** `trailingSlash: true` means the current path arrives as "/account/". */
function normalize(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/**
 * Chrome for the account pages. Gated on being signed in rather than on a role:
 * an owner has an account too, and bouncing them to their dashboard for asking
 * about their own profile would be the wrong answer.
 */
export function AccountShell({
  title,
  description,
  children,
}: AccountShellProps) {
  const pathname = normalize(usePathname());
  const user = useAuthStore((state) => state.user);

  // The tabs are the account entries from the header menu, so a page can never
  // exist that the menu does not know about.
  const tabs = user
    ? getAccountMenu(user.role).filter((item) => item.href?.startsWith("/account"))
    : [];

  return (
    <RoleGate>
      <section className="container-page pt-28 pb-20 sm:pt-32">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-brand-ink uppercase">
            Your account
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        </header>

        {tabs.length > 1 && (
          <nav
            aria-label="Account"
            className="mt-8 flex w-fit gap-1 rounded-full border bg-card p-1"
          >
            {tabs.map((tab) => {
              const active = normalize(tab.href ?? "") === pathname;

              return (
                <Link
                  key={tab.label}
                  href={tab.href ?? "#"}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-[0_8px_20px_rgb(38_22_10/0.12)]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <tab.icon className="size-4" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="mt-8">{children}</div>
      </section>
    </RoleGate>
  );
}
