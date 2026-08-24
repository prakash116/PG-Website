"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  LoaderCircle,
  MessageSquare,
  Phone,
  Send,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import { sendEnquiry } from "@/lib/api/contact";

const EMPTY = { name: "", phone: "", reason: "", description: "" };

/** Mirrors the API, so a message that would be refused never leaves the browser. */
function problemWith(form: typeof EMPTY): string | null {
  if (form.name.trim().length < 2) return "Enter your name.";
  if (!/^\d{10}$/.test(form.phone.trim())) {
    return "Enter a 10-digit mobile number.";
  }
  if (form.reason.trim().length < 3) return "Tell us what this is about.";
  if (form.description.trim().length < 10) {
    return "Describe it in a little more detail.";
  }
  return null;
}

export function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  function set(field: keyof typeof EMPTY, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const problem = problemWith(form);
    if (problem) {
      toast.error(problem);
      return;
    }

    setIsSending(true);

    try {
      const response = await sendEnquiry({
        name: form.name.trim(),
        phone: form.phone.trim(),
        reason: form.reason.trim(),
        description: form.description.trim(),
      });

      setForm(EMPTY);
      setIsSent(true);
      toast.success(response.message);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "Could not send your message. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  }

  // Sent state, rather than an empty form that looks like nothing happened.
  if (isSent) {
    return (
      <div className="rounded-3xl border bg-card p-8 text-center sm:p-12">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-7" />
        </span>
        <h2 className="mt-5 font-display text-xl font-bold text-foreground">
          Message sent
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          We have it, and we will call you back on the number you gave us.
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSent(false)}
          className="mt-6 h-11 rounded-full px-6 font-semibold"
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border bg-card p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-name">Your name</Label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="contact-name"
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
              placeholder="Aarav Sharma"
              maxLength={100}
              disabled={isSending}
              autoComplete="name"
              className="h-12 rounded-xl pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-phone">Mobile number</Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="contact-phone"
              value={form.phone}
              onChange={(event) =>
                // Digits only: it is the number we call back on.
                set("phone", event.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="9876543210"
              inputMode="numeric"
              disabled={isSending}
              autoComplete="tel"
              className="h-12 rounded-xl pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="contact-reason">Reason</Label>
          <div className="relative">
            <MessageSquare className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="contact-reason"
              value={form.reason}
              onChange={(event) => set("reason", event.target.value)}
              placeholder="What is this about?"
              maxLength={120}
              disabled={isSending}
              className="h-12 rounded-xl pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="contact-description">Description</Label>
          <Textarea
            id="contact-description"
            value={form.description}
            onChange={(event) => set("description", event.target.value)}
            placeholder="Tell us what happened, and what you need."
            rows={6}
            maxLength={2000}
            disabled={isSending}
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground">
            {form.description.trim().length < 10
              ? "A couple of sentences is plenty."
              : `${form.description.trim().length} of 2000 characters`}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          disabled={isSending}
          className="h-12 gap-2 rounded-full px-7 text-base font-semibold"
        >
          {isSending ? (
            <LoaderCircle className="size-4.5 animate-spin" />
          ) : (
            <Send className="size-4.5" />
          )}
          {isSending ? "Sending..." : "Send message"}
        </Button>
      </div>
    </form>
  );
}
