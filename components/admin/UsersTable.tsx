"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Ban,
  Building2,
  CalendarDays,
  Check,
  LoaderCircle,
  RotateCcw,
  Search,
  ShieldAlert,
  Trash2,
  TriangleAlert,
  Users,
} from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { SignupsChart } from "@/components/admin/SignupsChart";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import {
  deleteUserAccount,
  fetchUserStats,
  fetchUsers,
  restoreUserAccount,
  setUserBlocked,
  type AdminUser,
} from "@/lib/api/users";
import type { UserRole } from "@/lib/api/auth";
import { useCachedResource } from "@/stores/resource-cache";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<UserRole, string> = {
  USER: "Customer",
  PG_OWNER: "PG owner",
  SUPER_ADMIN: "Super admin",
};

type RoleFilter = "ALL" | "PG_OWNER" | "USER";

const ROLE_TABS: Array<{ value: RoleFilter; label: string; icon: typeof Users }> =
  [
    { value: "ALL", label: "Everyone", icon: Users },
    { value: "PG_OWNER", label: "PG owners", icon: Building2 },
    { value: "USER", label: "Customers", icon: Users },
  ];

function fullName(user: AdminUser): string {
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** YYYY-MM-DD from the date's own parts, so a range never shifts a day. */
function dayKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

const TODAY = dayKey(new Date());
const THIRTY_DAYS_AGO = dayKey(
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
);

type Pending =
  | { kind: "DELETE"; user: AdminUser }
  | { kind: "BLOCK"; user: AdminUser };

export function UsersTable() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [from, setFrom] = useState(THIRTY_DAYS_AGO);
  const [to, setTo] = useState(TODAY);
  /** Only the row being changed shows a spinner. */
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);

  const {
    data: users,
    error,
    set: setUsers,
  } = useCachedResource("admin/users", async () => (await fetchUsers()).data);

  // Keyed by the range, so moving the dates fetches that range and moving back
  // reads the first one straight out of the cache.
  const { data: stats } = useCachedResource(
    `admin/user-stats:${from}:${to}`,
    async () => (await fetchUserStats(from, to)).data,
  );

  async function act(id: string, run: () => Promise<{ message: string }>) {
    setBusyId(id);

    try {
      const result = await run();
      toast.success(result.message);
      // Re-read rather than patching the row: the server decides what the
      // account now looks like.
      setUsers((await fetchUsers()).data);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "That did not work. Try again.",
      );
    } finally {
      setBusyId(null);
      setPending(null);
    }
  }

  if (error && !users) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  if (!users) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-3xl border bg-card">
        <LoaderCircle className="size-6 animate-spin text-brand-ink" />
        <span className="sr-only">Loading accounts</span>
      </div>
    );
  }

  const needle = query.trim().toLowerCase();
  const visible = users.filter((user) => {
    if (role !== "ALL" && user.role !== role) return false;

    const joined = user.createdAt.slice(0, 10);
    if (joined < from || joined > to) return false;

    if (!needle) return true;

    return [fullName(user), user.email, user.phone]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  const countFor = (value: RoleFilter) =>
    value === "ALL"
      ? users.length
      : users.filter((user) => user.role === value).length;

  const isDelete = pending?.kind === "DELETE";
  const isOwnerDelete = isDelete && pending.user.role === "PG_OWNER";

  return (
    <div className="grid gap-5">
      {stats && <SignupsChart series={stats.series} />}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "All accounts", value: stats?.totalAccounts ?? users.length },
          { label: "PG owners", value: countFor("PG_OWNER") },
          { label: "Customers", value: countFor("USER") },
        ].map((tile) => (
          <div key={tile.label} className="rounded-2xl border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">
              {tile.label}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground">
              {tile.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div className="flex w-fit gap-1 rounded-full border bg-background p-1">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setRole(tab.value)}
                aria-pressed={role === tab.value}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  role === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <tab.icon className="size-4" />
                {tab.label}
                <span className="text-xs opacity-70">{countFor(tab.value)}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email or phone"
              aria-label="Search accounts"
              className="h-11 rounded-full pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 border-b p-5">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <CalendarDays className="size-3.5" />
            Joined between
          </span>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="usersFrom" className="sr-only">
              From
            </Label>
            <Input
              id="usersFrom"
              type="date"
              value={from}
              max={to}
              onChange={(event) => setFrom(event.target.value)}
              className="h-10 w-40 rounded-xl"
            />
          </div>
          <span className="pb-2.5 text-sm text-muted-foreground">and</span>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="usersTo" className="sr-only">
              To
            </Label>
            <Input
              id="usersTo"
              type="date"
              value={to}
              min={from}
              onChange={(event) => setTo(event.target.value)}
              className="h-10 w-40 rounded-xl"
            />
          </div>
          <p className="ml-auto text-sm text-muted-foreground">
            {visible.length} shown
          </p>
        </div>

        {visible.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No account matches these filters.
          </p>
        ) : (
          <ul className="divide-y">
            {visible.map((user) => {
              const isClosed = user.deletedAt !== null;
              const isBusy = busyId === user.id;
              const isProtected = user.role === "SUPER_ADMIN";

              return (
                <li
                  key={user.id}
                  className="flex flex-wrap items-center gap-4 p-5"
                >
                  <UserAvatar src={user.profileImage} name={fullName(user)} />

                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                      <span className="truncate">{fullName(user)}</span>
                      {isClosed && (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                          Deleting
                        </span>
                      )}
                      {user.isBlocked && !isClosed && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                          Blocked
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email} · {user.phone}
                    </p>
                  </div>

                  <div className="hidden w-32 shrink-0 sm:block">
                    <p className="text-xs font-medium text-foreground">
                      {ROLE_LABELS[user.role]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isClosed
                        ? `Closed ${formatDate(user.deletedAt!)}`
                        : `Joined ${formatDate(user.createdAt)}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {isProtected ? (
                      // Refused by the API; saying so beats a button that fails.
                      <span
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        title="A Super Admin cannot be blocked or deleted"
                      >
                        <ShieldAlert className="size-3.5" />
                        Protected
                      </span>
                    ) : isClosed ? (
                      <Button
                        variant="outline"
                        disabled={isBusy}
                        onClick={() =>
                          void act(user.id, () => restoreUserAccount(user.id))
                        }
                        className="h-10 gap-2 rounded-full font-semibold"
                      >
                        {isBusy ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <RotateCcw className="size-4" />
                        )}
                        Restore
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          disabled={isBusy}
                          onClick={() =>
                            user.isBlocked
                              ? void act(user.id, () =>
                                  setUserBlocked(user.id, false),
                                )
                              : setPending({ kind: "BLOCK", user })
                          }
                          className="h-10 gap-2 rounded-full font-semibold"
                        >
                          {isBusy ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : user.isBlocked ? (
                            <Check className="size-4" />
                          ) : (
                            <Ban className="size-4" />
                          )}
                          {user.isBlocked ? "Unblock" : "Block"}
                        </Button>

                        <Button
                          variant="ghost"
                          aria-label={`Delete ${fullName(user)}`}
                          disabled={isBusy}
                          onClick={() => setPending({ kind: "DELETE", user })}
                          className="size-10 rounded-full p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog
        open={pending !== null}
        onOpenChange={(next) => {
          if (!next && busyId === null) setPending(null);
        }}
      >
        <DialogContent className="gap-5 rounded-2xl sm:max-w-md">
          <DialogHeader>
            <span
              className={cn(
                "mb-1 flex size-11 items-center justify-center rounded-full",
                isDelete
                  ? "bg-destructive/10 text-destructive"
                  : "bg-secondary text-secondary-foreground",
              )}
            >
              {isDelete ? (
                <TriangleAlert className="size-5" />
              ) : (
                <Ban className="size-5" />
              )}
            </span>
            <DialogTitle className="font-display text-lg font-bold">
              {isDelete
                ? `Delete ${pending ? fullName(pending.user) : ""}?`
                : `Block ${pending ? fullName(pending.user) : ""}?`}
            </DialogTitle>
            <DialogDescription>
              {isDelete
                ? "They are signed out and cannot sign back in. The account stays restorable for 30 days, then it is deleted for good."
                : "They cannot sign in, and their current session stops working on the next request. Nothing is deleted and you can undo this at any time."}
            </DialogDescription>
          </DialogHeader>

          {isOwnerDelete && (
            // The single most destructive action in the app. It should read
            // like one.
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-semibold text-destructive">
                This is a PG owner
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Their listing comes off the site immediately. After 30 days the
                PG itself is deleted, and with it every room, resident, service,
                payment and support query recorded against it. Restoring inside
                30 days puts the listing back exactly as it was.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              disabled={busyId !== null}
              onClick={() => setPending(null)}
              className="rounded-full font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant={isDelete ? "destructive" : "default"}
              disabled={busyId !== null}
              onClick={() => {
                if (!pending) return;
                const { user, kind } = pending;

                void act(user.id, () =>
                  kind === "DELETE"
                    ? deleteUserAccount(user.id)
                    : setUserBlocked(user.id, true),
                );
              }}
              className="gap-2 rounded-full font-semibold"
            >
              {isDelete ? (
                <Trash2 className="size-4" />
              ) : (
                <Ban className="size-4" />
              )}
              {isDelete ? "Delete account" : "Block account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
