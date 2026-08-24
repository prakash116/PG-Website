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
  XCircle,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import {
  deleteTicket,
  fetchAllTickets,
  resolveTicket,
  type AdminSupportTicket,
  type SupportTicketStatus,
} from "@/lib/api/support";
import { useCachedResource } from "@/stores/resource-cache";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS: Record<
  SupportTicketStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  OPEN: {
    label: "Open",
    className: "bg-secondary text-secondary-foreground",
    icon: Clock,
  },
  SOLVED: {
    label: "Solved",
    className: "bg-success/10 text-success",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive",
    icon: XCircle,
  },
};

/** What the admin is about to do, held while the dialog is open. */
type Pending =
  | { kind: "SOLVED" | "REJECTED"; ticket: AdminSupportTicket }
  | { kind: "DELETE"; ticket: AdminSupportTicket };

export function SupportTable() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [response, setResponse] = useState("");

  const {
    data: tickets,
    error,
    set: setTickets,
  } = useCachedResource(
    "admin/support",
    async () => (await fetchAllTickets()).data,
  );

  async function act(id: string, run: () => Promise<{ message: string }>) {
    setBusyId(id);

    try {
      const result = await run();
      toast.success(result.message);
      // Re-read: answering moves a ticket down the list, and deleting removes
      // it. The server decides what the queue now looks like.
      setTickets((await fetchAllTickets()).data);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "That did not work. Try again.",
      );
    } finally {
      setBusyId(null);
      setPending(null);
      setResponse("");
    }
  }

  if (error && !tickets) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  if (!tickets) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-3xl border bg-card">
        <LoaderCircle className="size-6 animate-spin text-brand-ink" />
        <span className="sr-only">Loading queries</span>
      </div>
    );
  }

  const openCount = tickets.filter((one) => one.status === "OPEN").length;
  const isDelete = pending?.kind === "DELETE";

  return (
    <div className="rounded-3xl border bg-card">
      <div className="border-b p-5">
        <h2 className="font-display text-lg font-bold text-foreground">
          Queries
        </h2>
        <p className="text-sm text-muted-foreground">
          {tickets.length === 0
            ? "Nothing raised yet."
            : `${openCount} open of ${tickets.length}`}
        </p>
      </div>

      {tickets.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">
          When a PG owner raises a query, it appears here.
        </p>
      ) : (
        <ul className="divide-y">
          {tickets.map((ticket) => {
            const status = STATUS[ticket.status];
            const isBusy = busyId === ticket.id;
            const isOpen = ticket.status === "OPEN";

            return (
              <li key={ticket.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {ticket.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {ticket.pgName}{" "}
                      <span className="font-mono">{ticket.pgCode}</span> ·{" "}
                      {ticket.ownerName} · raised {formatDate(ticket.raisedAt)}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                      status.className,
                    )}
                  >
                    <status.icon className="size-3.5" />
                    {status.label}
                  </span>
                </div>

                <p className="mt-2.5 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {ticket.message}
                </p>

                {ticket.response && (
                  <div className="mt-3 rounded-xl border-l-2 border-brand-ink/40 bg-muted/40 py-3 pr-3 pl-4">
                    <p className="text-xs font-semibold text-brand-ink">
                      Your reply
                    </p>
                    <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-foreground">
                      {ticket.response}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a
                    href={`tel:${ticket.ownerPhone}`}
                    className="inline-flex h-10 items-center gap-2 rounded-full border bg-background px-4 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-brand-ink"
                  >
                    <Phone className="size-4" />
                    {ticket.ownerPhone}
                  </a>

                  {isOpen && (
                    <>
                      <Button
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => {
                          setPending({ kind: "SOLVED", ticket });
                          setResponse("");
                        }}
                        className="h-10 gap-2 rounded-full font-semibold"
                      >
                        {isBusy ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="size-4" />
                        )}
                        Solved
                      </Button>

                      <Button
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => {
                          setPending({ kind: "REJECTED", ticket });
                          setResponse("");
                        }}
                        className="h-10 gap-2 rounded-full border-destructive/40 font-semibold text-destructive hover:bg-destructive/5 hover:text-destructive"
                      >
                        <XCircle className="size-4" />
                        Reject
                      </Button>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    aria-label={`Delete query: ${ticket.title}`}
                    disabled={isBusy}
                    onClick={() => setPending({ kind: "DELETE", ticket })}
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
        open={pending !== null}
        onOpenChange={(next) => {
          if (!next && busyId === null) {
            setPending(null);
            setResponse("");
          }
        }}
      >
        <DialogContent className="gap-5 rounded-2xl sm:max-w-md">
          <DialogHeader>
            {isDelete && (
              <span className="mb-1 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <TriangleAlert className="size-5" />
              </span>
            )}
            <DialogTitle className="font-display text-lg font-bold">
              {isDelete
                ? "Delete this query?"
                : pending?.kind === "SOLVED"
                  ? "Mark as solved"
                  : "Reject this query"}
            </DialogTitle>
            <DialogDescription>
              {isDelete
                ? "It disappears from the owner's dashboard too. This cannot be undone."
                : `${pending?.ticket.ownerName} sees your reply on their dashboard. A query can only be answered once.`}
            </DialogDescription>
          </DialogHeader>

          {!isDelete && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="supportResponse">Reply</Label>
              <Textarea
                id="supportResponse"
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                placeholder={
                  pending?.kind === "REJECTED"
                    ? "Why this is not something we can fix."
                    : "What you did, or what they should do next."
                }
                rows={4}
                maxLength={2000}
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                {pending?.kind === "REJECTED"
                  ? "Worth writing — a rejection with no reason reads as a shrug."
                  : "Optional, but it saves them asking again."}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              disabled={busyId !== null}
              onClick={() => {
                setPending(null);
                setResponse("");
              }}
              className="rounded-full font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant={isDelete ? "destructive" : "default"}
              disabled={busyId !== null}
              onClick={() => {
                if (!pending) return;
                const { ticket, kind } = pending;

                void act(ticket.id, () =>
                  kind === "DELETE"
                    ? deleteTicket(ticket.id)
                    : resolveTicket(ticket.id, kind, response.trim() || undefined),
                );
              }}
              className="gap-2 rounded-full font-semibold"
            >
              {isDelete ? "Delete" : pending?.kind === "SOLVED" ? "Mark solved" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
