"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Database,
  KeyRound,
  LoaderCircle,
  Mail,
  Save,
  Send,
  ServerCog,
  ShieldCheck,
  ShieldOff,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api/client";
import {
  fetchMailSettings,
  fetchVerificationPolicy,
  sendTestMail,
  setVerificationPolicy,
  updateMailSettings,
  type MailSettings,
} from "@/lib/api/email";
import { useCachedResource } from "@/stores/resource-cache";
import { cn } from "@/lib/utils";

type FormState = {
  host: string;
  port: string;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
};

function toForm(settings: MailSettings): FormState {
  return {
    host: settings.host,
    port: String(settings.port),
    username: settings.username,
    // Never prefilled: the API does not return it, and a row of dots that is
    // not the real value only invites someone to save it by accident.
    password: "",
    fromName: settings.fromName,
    fromEmail: settings.fromEmail,
  };
}

const fieldBox = "flex flex-col gap-2";
const inputClass = "h-11 rounded-xl";

function formatDay(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MailSettingsForm() {
  const [form, setForm] = useState<FormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [testTo, setTestTo] = useState("");

  const {
    data: settings,
    error,
    set: setSettings,
  } = useCachedResource(
    "admin/mail-settings",
    async () => (await fetchMailSettings()).data,
  );

  const { data: policy, set: setPolicy } = useCachedResource(
    "admin/verification-policy",
    async () => (await fetchVerificationPolicy()).data,
  );

  // Seeded once, so a background refresh cannot wipe what is being typed.
  if (settings && form === null) {
    setForm(toForm(settings));
    setTestTo(settings.fromEmail);
  }

  function set(field: keyof FormState, value: string) {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;

    setIsSaving(true);

    try {
      const response = await updateMailSettings({
        host: form.host.trim(),
        port: Number(form.port),
        username: form.username.trim(),
        // Blank means "keep the stored one" — the API treats it that way too.
        ...(form.password.trim() ? { password: form.password.trim() } : {}),
        fromName: form.fromName.trim(),
        fromEmail: form.fromEmail.trim(),
      });

      setSettings(response.data);
      setForm(toForm(response.data));
      toast.success(response.message);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "Could not save the mail settings.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTest() {
    if (!testTo.trim()) {
      toast.error("Enter an address to send the test to.");
      return;
    }

    setIsTesting(true);

    try {
      const response = await sendTestMail(testTo.trim());
      toast.success(response.message);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "Could not send the test email.",
      );
    } finally {
      setIsTesting(false);
    }
  }

  async function handlePolicy(required: boolean) {
    setIsSavingPolicy(true);

    try {
      const response = await setVerificationPolicy(required);
      setPolicy(response.data);
      toast.success(response.message);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "Could not change the verification setting.",
      );
    } finally {
      setIsSavingPolicy(false);
    }
  }

  const required = policy?.requireEmailVerification ?? true;

  /**
   * Its own block, so the switch stays usable even when the SMTP settings
   * fail to load — turning verification *off* is exactly what an admin needs
   * when email is the thing that is broken.
   */
  const verificationCard = (
    <div className="rounded-3xl border bg-card p-6 sm:p-7">
      <div className="flex flex-wrap items-start gap-4">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            required
              ? "bg-success/10 text-success"
              : "bg-accent text-accent-foreground",
          )}
        >
          {required ? (
            <ShieldCheck className="size-5" />
          ) : (
            <ShieldOff className="size-5" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold text-foreground">
            Email verification at sign-up
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {required
              ? "New accounts must enter the 6-digit code sent to their address before they can register."
              : "New accounts can register without proving their address. The verify step disappears from the sign-up form."}
          </p>
          {policy?.updatedAt && (
            <p className="mt-2 text-xs text-muted-foreground">
              Last changed
              {policy.updatedBy ? ` by ${policy.updatedBy}` : ""} on{" "}
              {formatDay(policy.updatedAt)}.
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span
            className={cn(
              "text-sm font-semibold",
              required ? "text-success" : "text-muted-foreground",
            )}
          >
            {isSavingPolicy ? "Saving..." : required ? "Required" : "Optional"}
          </span>
          {isSavingPolicy ? (
            <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          ) : (
            <Switch
              checked={required}
              disabled={!policy}
              onCheckedChange={(checked) => void handlePolicy(checked)}
              aria-label="Require email verification at sign-up"
            />
          )}
        </div>
      </div>

      {!required && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-accent/40 p-3 text-xs text-muted-foreground">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-brand-ink" />
          Anyone can sign up with an address they do not own, and those accounts
          are recorded as unverified. Turn this back on once email is working.
        </p>
      )}
    </div>
  );

  let mailSection: React.ReactNode;

  if (error && !settings) {
    mailSection = (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  } else if (!settings || !form) {
    mailSection = (
      <div className="flex min-h-60 items-center justify-center rounded-3xl border bg-card">
        <LoaderCircle className="size-6 animate-spin text-brand-ink" />
        <span className="sr-only">Loading mail settings</span>
      </div>
    );
  } else {
    const fromEnvironment = settings.source === "ENVIRONMENT";

    mailSection = (
      <>
        <div
          className={cn(
            "flex flex-wrap items-start gap-3 rounded-2xl border p-5",
            fromEnvironment ? "bg-accent/40" : "bg-card",
          )}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-brand-ink">
            {fromEnvironment ? (
              <ServerCog className="size-5" />
            ) : (
              <Database className="size-5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {fromEnvironment
                ? "Using the server's SMTP_* variables"
                : "Using the settings saved here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {fromEnvironment
                ? "Nothing has been saved on this page yet. Saving below takes over, and takes effect on the next email — no redeploy."
                : `Last changed${settings.updatedBy ? ` by ${settings.updatedBy}` : ""}${
                    settings.updatedAt
                      ? ` on ${formatDay(settings.updatedAt)}`
                      : ""
                  }.`}
            </p>
          </div>
          {!settings.hasPassword && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
              <TriangleAlert className="size-3.5" />
              No password stored
            </span>
          )}
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-3xl border bg-card p-6 sm:p-7"
        >
          <div className="mb-6 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Mail className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Sending account
              </h2>
              <p className="text-sm text-muted-foreground">
                Verification codes go out from here.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className={`${fieldBox} sm:col-span-2`}>
              <Label htmlFor="mail-host">SMTP host</Label>
              <Input
                id="mail-host"
                value={form.host}
                onChange={(event) => set("host", event.target.value)}
                placeholder="smtp.gmail.com"
                disabled={isSaving}
                className={inputClass}
              />
            </div>

            <div className={fieldBox}>
              <Label htmlFor="mail-port">Port</Label>
              <Input
                id="mail-port"
                value={form.port}
                onChange={(event) =>
                  set("port", event.target.value.replace(/\D/g, "").slice(0, 5))
                }
                placeholder="587"
                inputMode="numeric"
                disabled={isSaving}
                className={inputClass}
              />
              <p className="text-xs text-muted-foreground">
                587 for STARTTLS, 465 for TLS.
              </p>
            </div>

            <div className={fieldBox}>
              <Label htmlFor="mail-username">Username</Label>
              <Input
                id="mail-username"
                value={form.username}
                onChange={(event) => set("username", event.target.value)}
                placeholder="you@gmail.com"
                autoComplete="off"
                disabled={isSaving}
                className={inputClass}
              />
            </div>

            <div className={`${fieldBox} sm:col-span-2`}>
              <Label htmlFor="mail-password">
                <KeyRound className="mr-1 inline size-3.5" />
                App password
              </Label>
              <Input
                id="mail-password"
                type="password"
                value={form.password}
                onChange={(event) => set("password", event.target.value)}
                placeholder={
                  settings.hasPassword
                    ? "Leave blank to keep the stored password"
                    : "Paste the 16-character app password"
                }
                autoComplete="new-password"
                disabled={isSaving}
                className={inputClass}
              />
              <p className="text-xs text-muted-foreground">
                For Gmail this must be an App Password, not the account
                password. It is encrypted before it is stored and never sent
                back to this page.
              </p>
            </div>

            <div className={fieldBox}>
              <Label htmlFor="mail-from-name">From name</Label>
              <Input
                id="mail-from-name"
                value={form.fromName}
                onChange={(event) => set("fromName", event.target.value)}
                placeholder="Pzee"
                disabled={isSaving}
                className={inputClass}
              />
            </div>

            <div className={fieldBox}>
              <Label htmlFor="mail-from-email">From address</Label>
              <Input
                id="mail-from-email"
                type="email"
                value={form.fromEmail}
                onChange={(event) => set("fromEmail", event.target.value)}
                placeholder="no-reply@pzee.in"
                disabled={isSaving}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="h-11 gap-2 rounded-full px-6 font-semibold"
            >
              {isSaving ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isSaving ? "Saving..." : "Save settings"}
            </Button>
          </div>
        </form>

        <div className="rounded-3xl border bg-card p-6 sm:p-7">
          <h2 className="font-display text-lg font-bold text-foreground">
            Send a test
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Checks the credentials and delivers a real message, so you find out
            here rather than when someone tries to register.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input
              value={testTo}
              onChange={(event) => setTestTo(event.target.value)}
              placeholder="you@example.com"
              type="email"
              aria-label="Send the test email to"
              className="h-11 flex-1 rounded-xl"
            />
            <Button
              variant="outline"
              disabled={isTesting}
              onClick={() => void handleTest()}
              className="h-11 shrink-0 gap-2 rounded-full px-6 font-semibold"
            >
              {isTesting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {isTesting ? "Sending..." : "Send test email"}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="grid gap-5">
      {verificationCard}
      {mailSection}
    </div>
  );
}
