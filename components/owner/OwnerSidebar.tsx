"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LoaderCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { OWNER_NAV, type OwnerNavItem } from "./owner-nav";

interface OwnerSidebarProps {
  /** Closes the mobile drawer after a link is followed. */
  onNavigate?: () => void;
}

const linkBase =
  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";

const activeLink =
  "bg-primary text-primary-foreground shadow-[0_8px_20px_rgb(38_22_10/0.12)]";

const idleLink = "text-muted-foreground hover:bg-accent hover:text-foreground";

function SoonBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase",
        isActive
          ? "bg-primary-foreground/20 text-primary-foreground"
          : "bg-secondary text-muted-foreground"
      )}
    >
      Soon
    </span>
  );
}

/** A nav entry with sub-pages, e.g. CRM → Total guests · Services. */
function NavGroup({
  item,
  pathname,
  onNavigate,
}: {
  item: OwnerNavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const children = item.children ?? [];

  // A child route is matched exactly, since the parent href is also a child.
  const activeChild = children.find((child) => pathname === child.href);
  const isInSection =
    pathname === item.href || pathname.startsWith(`${item.href}/`);

  // Opens itself when you are inside it, and stays where you put it after that.
  const [isOpen, setIsOpen] = useState(isInSection);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className={cn(
          linkBase,
          "w-full",
          isInSection && !activeChild ? activeLink : idleLink
        )}
      >
        <item.icon className="size-4.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <ul className="mt-1 space-y-1 border-l pl-3 ml-5">
          {children.map((child) => {
            const isActive = pathname === child.href;

            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-accent font-semibold text-brand-ink"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function OwnerSidebar({ onNavigate }: OwnerSidebarProps) {
  const pathname = usePathname();
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const logout = useAuthStore((state) => state.logout);

  async function handleLogout() {
    await logout();
    // A full navigation clears every client store, so no stale PG data is
    // left behind for the next person to sign in on this device.
    window.location.href = "/login";
  }

  return (
    <div className="flex h-full flex-col gap-1 p-3">
      <nav className="flex-1 space-y-1">
        {OWNER_NAV.map((item) => {
          if (item.children?.length) {
            return (
              <NavGroup
                key={item.href}
                item={item}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            );
          }

          // Trailing slashes are on, so compare on the leading segment.
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(linkBase, isActive ? activeLink : idleLink)}
            >
              <item.icon className="size-4.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.isPreview && <SoonBadge isActive={isActive} />}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
      >
        {isLoggingOut ? (
          <LoaderCircle className="size-4.5 shrink-0 animate-spin" />
        ) : (
          <LogOut className="size-4.5 shrink-0" />
        )}
        {isLoggingOut ? "Logging out..." : "Log out"}
      </button>
    </div>
  );
}
