"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { LoaderCircle, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAccountMenu } from "@/lib/auth/account-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

interface ProfileMenuProps {
  /** Matches the transparent header state on the homepage hero. */
  transparent?: boolean;
}

export function ProfileMenu({ transparent }: ProfileMenuProps) {
  const user = useAuthStore((state) => state.user);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const logout = useAuthStore((state) => state.logout);

  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const items = getAccountMenu(user.role);

  async function handleLogout() {
    await logout();
    toast.success("Logged out.");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            aria-label={`Account menu for ${fullName}`}
            className={cn(
              "size-10 rounded-full p-0",
              transparent &&
                "border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            )}
          >
            <UserRound className="size-4.5" />
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-60 min-w-60 p-1.5"
      >
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-semibold text-foreground">
            {fullName}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />

        {items.map((item) =>
          item.href ? (
            <DropdownMenuItem
              key={item.label}
              className="gap-2 px-2 py-2 text-sm font-medium"
              render={<Link href={item.href} />}
            >
              <item.icon className="size-4 text-muted-foreground" />
              {item.label}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              key={item.label}
              disabled
              className="gap-2 px-2 py-2 text-sm font-medium"
            >
              <item.icon className="size-4 text-muted-foreground" />
              {item.label}
              {item.soon && (
                <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[0.625rem] font-semibold tracking-wide text-secondary-foreground uppercase">
                  Soon
                </span>
              )}
            </DropdownMenuItem>
          )
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isLoggingOut}
          onClick={() => void handleLogout()}
          className="gap-2 px-2 py-2 text-sm font-medium"
        >
          {isLoggingOut ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          {isLoggingOut ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
