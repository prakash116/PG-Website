"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Clock,
  LoaderCircle,
  Phone,
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
import { ApiError } from "@/lib/api/client";
import {
  deleteEnquiry,
  fetchEnquiries,
  resolveEnquiry,
  type ContactEnquiry,
} from "@/lib/api/contact";
import { useCachedResource } from "@/stores/resource-cache";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ContactTable() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ContactEnquiry | null>(
    null,
  );

  const {
    data: enquiries,
    error,
    set: setEnquiries,
  } = useCachedResource(
    "admin/contact",
    async () => (await fetchEnquiries()).data,
  );

  async function act(id: string, run: () => Promise<{ message: string }>) {
    setBusyId(id);

    try {
      const result = await run();
      toast.success(result.message);
      // Re-read: resolving moves it down the list, deleting removes it.
      setEnquiries((await fetchEnquiries()).data);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "That did not work. Try again.",
      );
    } finally {
      setBusyId(null);
      setPendingDelete(null);
    }
  }

  if (error && !enquiries) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  if (!enquiries) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-3xl border bg-card">
        <LoaderCircle className="size-6 animate-spin text-brand-ink" />
        <span className="sr-only">Loading enquiries</span>
      </div>
    );
  }

  const newCount = enquiries.filter((one) => one.status === "NEW").length;

  return (
    <div className="rounded-3xl border bg-card">
      <div className="border-b p-5">
        <h2 className="font-display text-lg font-bold text-foreground">
          Enquiries
        </h2>
        <p className="text-sm text-muted-foreground">
          {enquiries.length === 0
            ? "Nothing sent yet."
            : `${newCount} new of ${enquiries.length}`}
        </p>
      </div>

      {enquiries.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">
          Messages from the Contact Us page appear here.
        </p>
      ) : (
        <ul className="divide-y">
          {enquiries.map((enquiry) => {
            const isNew = enquiry.status === "NEW";
            const isBusy = busyId === enquiry.id;

            return (
              <li key={enquiry.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {enquiry.reason}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {enquiry.name} · sent {formatDate(enquiry.sentAt)}
                      {enquiry.resolvedAt &&
                        ` · resolved ${formatDate(enquiry.resolvedAt)}`}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                      isNew
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-success/10 text-success",
                    )}
                  >
                    {isNew ? (
                      <Clock className="size-3.5" />
                    ) : (
                      <CheckCircle2 className="size-3.5" />
                    )}
                    {isNew ? "New" : "Resolved"}
                  </span>
                </div>

                <p className="mt-2.5 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {enquiry.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a
                    href={`tel:${enquiry.phone}`}
                    className="inline-flex h-10 items-center gap-2 rounded-full border bg-background px-4 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-brand-ink"
                  >
                    <Phone className="size-4" />
                    {enquiry.phone}
                  </a>

                  {isNew && (
                    <Button
                      variant="outline"
                      disabled={isBusy}
                      onClick={() =>
                        void act(enquiry.id, () => resolveEnquiry(enquiry.id))
                      }
                      className="h-10 gap-2 rounded-full font-semibold"
                    >
                      {isBusy ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      Resolve
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    aria-label={`Delete enquiry from ${enquiry.name}`}
                    disabled={isBusy}
                    onClick={() => setPendingDelete(enquiry)}
                    className="ml-auto size-10 rounded-full p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

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
              Delete this enquiry?
            </DialogTitle>
            <DialogDescription>
              {pendingDelete?.name} · {pendingDelete?.phone}. This cannot be
              undone — resolve it instead if you want to keep the record.
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
                void act(target.id, () => deleteEnquiry(target.id));
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
