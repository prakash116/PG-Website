"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Clock,
  Headset,
  LoaderCircle,
  Send,
  XCircle,
} from "lucide-react";
import { PageHeader } from "../PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import {
  fetchMyTickets,
  raiseTicket,
  type SupportTicket,
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

/** The owner's contact form, with everything they have already asked below it. */
export function SupportSection() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const {
    data: tickets,
    error,
    set: setTickets,
  } = useCachedResource(
    "support/me",
    async () => (await fetchMyTickets()).data,
  );

  // Mirrors the API, so a query that would be refused never leaves the browser.
  const canSend = title.trim().length >= 4 && message.trim().length >= 10;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSend) return;

    setIsSending(true);

    try {
      const response = await raiseTicket({
        title: title.trim(),
        message: message.trim(),
      });

      // The new query goes straight to the top rather than costing a refetch.
      setTickets([response.data, ...(tickets ?? [])]);
      setTitle("");
      setMessage("");
      toast.success(response.message);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "Could not send your query. Try again.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <PageHeader
        title="PG Support"
        description="Something not working? Tell us, and track what we said back."
      />

      <div className="grid gap-5">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-card p-6 sm:p-7"
        >
          <div className="mb-5 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Headset className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Raise a query
              </h2>
              <p className="text-sm text-muted-foreground">
                We reply on the number registered to your PG.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="support-title">Query title</Label>
              <Input
                id="support-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Cannot upload room photos"
                maxLength={120}
                disabled={isSending}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="support-message">What is the problem?</Label>
              <Textarea
                id="support-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Tell us what you did, and what happened instead."
                rows={5}
                maxLength={2000}
                disabled={isSending}
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                {message.trim().length < 10
                  ? "A sentence or two is enough to get started."
                  : `${message.trim().length} of 2000 characters`}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              disabled={!canSend || isSending}
              className="h-11 gap-2 rounded-full px-6 font-semibold"
            >
              {isSending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {isSending ? "Sending..." : "Raise query"}
            </Button>
          </div>
        </form>

        <section className="rounded-2xl border bg-card">
          <div className="border-b p-5">
            <h2 className="font-display text-lg font-bold text-foreground">
              Your queries
            </h2>
            <p className="text-sm text-muted-foreground">
              {tickets?.length
                ? `${tickets.length} raised`
                : "Nothing raised yet."}
            </p>
          </div>

          {error && !tickets ? (
            <p className="p-6 text-center text-sm font-medium text-destructive">
              {error}
            </p>
          ) : !tickets ? (
            <div className="flex min-h-32 items-center justify-center">
              <LoaderCircle className="size-6 animate-spin text-brand-ink" />
              <span className="sr-only">Loading your queries</span>
            </div>
          ) : tickets.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              When you raise a query it shows up here with its status.
            </p>
          ) : (
            <ul className="divide-y">
              {tickets.map((ticket: SupportTicket) => {
                const status = STATUS[ticket.status];

                return (
                  <li key={ticket.id} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {ticket.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Raised {formatDate(ticket.raisedAt)}
                          {ticket.resolvedAt &&
                            ` · answered ${formatDate(ticket.resolvedAt)}`}
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
                          Pzee replied
                        </p>
                        <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-foreground">
                          {ticket.response}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
