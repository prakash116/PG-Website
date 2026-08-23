"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  LoaderCircle,
  RotateCcw,
  Search,
  ShieldAlert,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
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
import { ApiError } from "@/lib/api/client";
import {
  deleteUserAccount,
  fetchUsers,
  restoreUserAccount,
  type AdminUser,
} from "@/lib/api/users";
import type { UserRole } from "@/lib/api/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  USER: "Customer",
  PG_OWNER: "PG owner",
  SUPER_ADMIN: "Super admin",
};

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

export function UsersTable() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  /** The id currently being closed or restored, so only its row shows a spinner. */
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const response = await fetchUsers();
        if (active) setUsers(response.data);
      } catch (caught) {
        if (!active) return;
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Could not load accounts. Try again."
        );
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function act(
    user: AdminUser,
    run: (id: string) => Promise<{ message: string }>
  ) {
    setBusyId(user.id);

    try {
      const response = await run(user.id);
      toast.success(response.message);
      // Re-read rather than patching the row: closing also changes isActive,
      // and the server is the one that decides what the account now looks like.
      setUsers((await fetchUsers()).data);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "That did not work. Try again."
      );
    } finally {
      setBusyId(null);
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
      <div className="flex min-h-60 items-center justify-center">
        <LoaderCircle className="size-7 animate-spin text-brand-ink" />
        <span className="sr-only">Loading accounts</span>
      </div>
    );
  }

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? users.filter((user) =>
        [fullName(user), user.email, user.phone]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      )
    : users;

  const closedCount = users.filter((user) => user.deletedAt).length;

  return (
    <div className="rounded-3xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">
            Accounts
          </h2>
          <p className="text-sm text-muted-foreground">
            {users.length} total
            {closedCount > 0 && ` · ${closedCount} awaiting deletion`}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
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

      {visible.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">
          No account matches “{query}”.
        </p>
      ) : (
        <ul className="divide-y">
          {visible.map((user) => {
            const isClosed = user.deletedAt !== null;
            const isBusy = busyId === user.id;
            const isCustomer = user.role === "USER";

            return (
              <li
                key={user.id}
                className="flex flex-wrap items-center gap-4 p-5"
              >
                <UserAvatar src={user.profileImage} name={fullName(user)} />

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-sm font-semibold text-foreground">
                    {fullName(user)}
                    {isClosed && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                        Deleting
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

                <div className="shrink-0">
                  {isClosed ? (
                    <Button
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => void act(user, restoreUserAccount)}
                      className="h-10 gap-2 rounded-full font-semibold"
                    >
                      {isBusy ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <RotateCcw className="size-4" />
                      )}
                      Restore
                    </Button>
                  ) : isCustomer ? (
                    <Button
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => setPendingDelete(user)}
                      className="h-10 gap-2 rounded-full border-destructive/40 font-semibold text-destructive hover:bg-destructive/5 hover:text-destructive"
                    >
                      {isBusy ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      Delete
                    </Button>
                  ) : (
                    // Owners and admins are refused by the API; saying so here
                    // is kinder than offering a button that always fails.
                    <span
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      title="Deleting this account would remove its PG and payment history"
                    >
                      <ShieldAlert className="size-3.5" />
                      Protected
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Deleting someone else's account should never be one click away. */}
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(next) => {
          if (!next && busyId === null) setPendingDelete(null);
        }}
      >
        <DialogContent className="gap-5 rounded-2xl sm:max-w-md">
          <DialogHeader>
            <span className="mb-1 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <TriangleAlert className="size-5" />
            </span>
            <DialogTitle className="font-display text-lg font-bold">
              Delete {pendingDelete ? fullName(pendingDelete) : "this account"}?
            </DialogTitle>
            <DialogDescription>
              They will be signed out and cannot sign back in. The account stays
              restorable for 30 days, then it is deleted for good along with
              every visit request they booked.
            </DialogDescription>
          </DialogHeader>

          {pendingDelete && (
            <div className="rounded-2xl border bg-muted/40 p-4 text-sm">
              <p className="font-semibold text-foreground">
                {fullName(pendingDelete)}
              </p>
              <p className="text-muted-foreground">
                {pendingDelete.email} · {pendingDelete.phone}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              disabled={busyId !== null}
              onClick={() => setPendingDelete(null)}
              className="rounded-full font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busyId !== null}
              onClick={() => {
                if (!pendingDelete) return;
                const target = pendingDelete;
                setPendingDelete(null);
                void act(target, deleteUserAccount);
              }}
              className="gap-2 rounded-full font-semibold"
            >
              <Trash2 className="size-4" />
              Delete account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
