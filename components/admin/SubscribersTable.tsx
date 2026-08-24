"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Ban,
  Check,
  LoaderCircle,
  Mail,
  Search,
  Trash2,
  TriangleAlert,
} from "lucide-react";
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
  deleteSubscriber,
  fetchSubscribers,
  setSubscriberStatus,
  type Subscriber,
} from "@/lib/api/subscribers";
import { useCachedResource } from "@/stores/resource-cache";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function SubscribersTable() {
  const [query, setQuery] = useState("");
  /** Only the row being changed shows a spinner. */
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Subscriber | null>(null);

  const {
    data: subscribers,
    error,
    set: setSubscribers,
  } = useCachedResource(
    "admin/subscribers",
    async () => (await fetchSubscribers()).data,
  );

  async function act(
    subscriber: Subscriber,
    run: () => Promise<{ message: string }>,
  ) {
    setBusyId(subscriber.id);

    try {
      const response = await run();
      toast.success(response.message);
      // Re-read rather than patching the row: a delete removes it and a block
      // stamps a date, and the server decides what the list now looks like.
      setSubscribers((await fetchSubscribers()).data);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "That did not work. Try again.",
      );
    } finally {
      setBusyId(null);
    }
  }

  if (error && !subscribers) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  if (!subscribers) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-3xl border bg-card">
        <LoaderCircle className="size-6 animate-spin text-brand-ink" />
        <span className="sr-only">Loading subscribers</span>
      </div>
    );
  }

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? subscribers.filter((one) => one.email.toLowerCase().includes(needle))
    : subscribers;

  const blockedCount = subscribers.filter(
    (one) => one.status === "BLOCKED",
  ).length;

  return (
    <div className="rounded-3xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">
            Subscribers
          </h2>
          <p className="text-sm text-muted-foreground">
            {subscribers.length} total
            {blockedCount > 0 && ` · ${blockedCount} blocked`}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by email"
            aria-label="Search subscribers"
            className="h-11 rounded-full pl-10"
          />
        </div>
      </div>

      {subscribers.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">
          Nobody has subscribed yet. The form in the site footer feeds this list.
        </p>
      ) : visible.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">
          No address matches “{query}”.
        </p>
      ) : (
        <ul className="divide-y">
          {visible.map((one) => {
            const isBlocked = one.status === "BLOCKED";
            const isBusy = busyId === one.id;

            return (
              <li key={one.id} className="flex flex-wrap items-center gap-4 p-5">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    isBlocked
                      ? "bg-destructive/10 text-destructive"
                      : "bg-accent text-accent-foreground",
                  )}
                >
                  <Mail className="size-4.5" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {one.email}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Subscribed {formatDate(one.subscribedAt)}
                    {isBlocked &&
                      one.blockedAt &&
                      ` · blocked ${formatDate(one.blockedAt)}`}
                  </p>
                </div>

                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                    isBlocked
                      ? "bg-destructive/10 text-destructive"
                      : "bg-success/10 text-success",
                  )}
                >
                  {isBlocked ? "Blocked" : "Active"}
                </span>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={isBusy}
                    onClick={() =>
                      void act(one, () =>
                        setSubscriberStatus(
                          one.id,
                          isBlocked ? "ACTIVE" : "BLOCKED",
                        ),
                      )
                    }
                    className="h-10 gap-2 rounded-full font-semibold"
                  >
                    {isBusy ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : isBlocked ? (
                      <Check className="size-4" />
                    ) : (
                      <Ban className="size-4" />
                    )}
                    {isBlocked ? "Unblock" : "Block"}
                  </Button>

                  <Button
                    variant="ghost"
                    aria-label={`Delete ${one.email}`}
                    disabled={isBusy}
                    onClick={() => setPendingDelete(one)}
                    className="size-10 rounded-full p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Deleting is permanent, so it is never one click away. */}
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
              Delete {pendingDelete?.email}?
            </DialogTitle>
            <DialogDescription>
              This removes the address for good. To stop the email but keep the
              record, block them instead.
            </DialogDescription>
          </DialogHeader>

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
                void act(target, () => deleteSubscriber(target.id));
              }}
              className="gap-2 rounded-full font-semibold"
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
