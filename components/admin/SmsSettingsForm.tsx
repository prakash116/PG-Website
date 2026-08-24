"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Database,
  KeyRound,
  LoaderCircle,
  MessageSquareText,
  Save,
  ServerCog,
  Smartphone,
  SmartphoneNfc,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api/client";
import {
  fetchVerificationPolicy,
  setPhoneVerificationPolicy,
} from "@/lib/api/email";
import {
  fetchSmsSettings,
  updateSmsSettings,
  type SmsSettings,
} from "@/lib/api/phone";
import { useCachedResource } from "@/stores/resource-cache";
import { cn } from "@/lib/utils";

type FormState = {
  widgetId: string;
  tokenAuth: string;
  authkey: string;
};

function toForm(settings: SmsSettings): FormState {
  return {
    widgetId: settings.widgetId,
    tokenAuth: settings.tokenAuth,
    // Never prefilled: the API does not return it, and a row of dots that is
    // not the real value only invites someone to save it by accident.
    authkey: "",
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

export function SmsSettingsForm() {
  const [form, setForm] = useState<FormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  const {
    data: settings,
    error,
    set: setSettings,
  } = useCachedResource(
    "admin/sms-settings",
    async () => (await fetchSmsSettings()).data,
  );

  // The same cache key MailSettingsForm uses, so the two forms share one
  // policy object and a toggle in either is immediately true in both.
  const { data: policy, set: setPolicy } = useCachedResource(
    "admin/verification-policy",
    async () => (await fetchVerificationPolicy()).data,
  );

  // Seeded once, so a background refresh cannot wipe what is being typed.
  if (settings && form === null) {
    setForm(toForm(settings));
  }

  function set(field: keyof FormState, value: string) {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;

    setIsSaving(true);

    try {
      const response = await updateSmsSettings({
        widgetId: form.widgetId.trim(),
        tokenAuth: form.tokenAuth.trim(),
        // Blank means "keep the stored one" — the API treats it that way too.
        ...(form.authkey.trim() ? { authkey: form.authkey.trim() } : {}),
      });

      setSettings(response.data);
      setForm(toForm(response.data));
      toast.success(response.message);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "Could not save the SMS settings.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePolicy(required: boolean) {
    setIsSavingPolicy(true);

    try {
      const response = await setPhoneVerificationPolicy(required);
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

  const required = policy?.requirePhoneVerification ?? false;

  /**
   * Its own block, so the switch stays usable even when the widget settings
   * fail to load — turning the requirement off is exactly what an admin
   * needs when SMS is the thing that is broken.
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
            <SmartphoneNfc className="size-5" />
          ) : (
            <Smartphone className="size-5" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold text-foreground">
            Mobile verification at sign-up
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {required
              ? "New accounts must enter the code sent to their number by SMS before they can register."
              : "New accounts can register without proving their number. The verify step disappears from the sign-up form."}
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
              aria-label="Require mobile verification at sign-up"
            />
          )}
        </div>
      </div>

      {required && settings && !(settings.widgetId && settings.tokenAuth) && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-destructive/5 p-3 text-xs text-destructive">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          Verification is required but the MSG91 widget below is not set up —
          nobody can register until it is. Add the widget id and token auth, or
          turn the requirement off.
        </p>
      )}
    </div>
  );

  let smsSection: React.ReactNode;

  if (error && !settings) {
    smsSection = (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  } else if (!settings || !form) {
    smsSection = (
      <div className="flex min-h-60 items-center justify-center rounded-3xl border bg-card">
        <LoaderCircle className="size-6 animate-spin text-brand-ink" />
        <span className="sr-only">Loading SMS settings</span>
      </div>
    );
  } else {
    const fromEnvironment = settings.source === "ENVIRONMENT";

    smsSection = (
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
                ? "Using the server's MSG91_* variables"
                : "Using the settings saved here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {fromEnvironment
                ? "Nothing has been saved on this page yet. Saving below takes over, and takes effect on the next verification — no redeploy."
                : `Last changed${settings.updatedBy ? ` by ${settings.updatedBy}` : ""}${
                    settings.updatedAt
                      ? ` on ${formatDay(settings.updatedAt)}`
                      : ""
                  }.`}
            </p>
          </div>
          {!settings.hasAuthkey && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
              <TriangleAlert className="size-3.5" />
              No authkey stored
            </span>
          )}
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-3xl border bg-card p-6 sm:p-7"
        >
          <div className="mb-6 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <MessageSquareText className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                MSG91 account
              </h2>
              <p className="text-sm text-muted-foreground">
                SMS codes go out through this OTP widget. From the MSG91
                dashboard: OTP, your widget, Integration.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className={fieldBox}>
              <Label htmlFor="sms-widget-id">Widget id</Label>
              <Input
                id="sms-widget-id"
                value={form.widgetId}
                onChange={(event) => set("widgetId", event.target.value)}
                placeholder="3565664b4b38323831353334"
                autoComplete="off"
                disabled={isSaving}
                className={inputClass}
              />
              <p className="text-xs text-muted-foreground">
                The long hex id from the integration snippet — not the
                widget&apos;s display name.
              </p>
            </div>

            <div className={fieldBox}>
              <Label htmlFor="sms-token-auth">Token auth</Label>
              <Input
                id="sms-token-auth"
                value={form.tokenAuth}
                onChange={(event) => set("tokenAuth", event.target.value)}
                placeholder="123456TxxxxxxxxxxxxP1"
                autoComplete="off"
                disabled={isSaving}
                className={inputClass}
              />
            </div>

            <div className={`${fieldBox} sm:col-span-2`}>
              <Label htmlFor="sms-authkey">
                <KeyRound className="mr-1 inline size-3.5" />
                Authkey
              </Label>
              <Input
                id="sms-authkey"
                type="password"
                value={form.authkey}
                onChange={(event) => set("authkey", event.target.value)}
                placeholder={
                  settings.hasAuthkey
                    ? "Leave blank to keep the stored authkey"
                    : "Paste the account authkey"
                }
                autoComplete="new-password"
                disabled={isSaving}
                className={inputClass}
              />
              <p className="text-xs text-muted-foreground">
                From the MSG91 dashboard&apos;s Authkey page. It stays
                server-side, is encrypted before it is stored, and is never
                sent back to this page.
              </p>
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
      </>
    );
  }

  return (
    <div className="grid gap-5">
      {verificationCard}
      {smsSection}
    </div>
  );
}
