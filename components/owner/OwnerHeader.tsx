"use client";

import { useState } from "react";
import { ExternalLink, Menu } from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth-store";
import { OwnerSidebar } from "./OwnerSidebar";
import type { OwnerNavItem } from "./owner-nav";

interface OwnerHeaderProps {
  /** Shown under the name. Defaults to the PG owner's label. */
  subtitle?: string;
  /** Drawer heading on mobile. */
  drawerTitle?: string;
  drawerDescription?: string;
  /** Sidebar contents, for a dashboard that is not the owner's. */
  nav?: OwnerNavItem[];
}

export function OwnerHeader({
  subtitle = "PG Owner account",
  drawerTitle = "PG Owner",
  drawerDescription = "Manage your property",
  nav,
}: OwnerHeaderProps = {}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : "PG Owner";

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        {/* Mobile: the sidebar lives in a drawer */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                aria-label="Open menu"
                className="size-10 rounded-xl p-0 lg:hidden"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle className="font-display text-base font-bold">
                {drawerTitle}
              </SheetTitle>
              <SheetDescription className="text-xs">
                {drawerDescription}
              </SheetDescription>
            </SheetHeader>
            <OwnerSidebar nav={nav} onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Left: who is signed in */}
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar src={user?.profileImage ?? null} name={fullName} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">
              {fullName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: back to the public site, in its own tab */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex h-10 items-center gap-2 rounded-full border bg-background px-3.5 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-brand-ink sm:px-4"
        >
          <span className="hidden sm:inline">View website</span>
          <span className="sm:hidden">Site</span>
          <ExternalLink className="size-4" />
        </a>
      </div>
    </header>
  );
}
