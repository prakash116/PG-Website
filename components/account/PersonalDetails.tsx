"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LoaderCircle, MailCheck, PhoneCall, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api/client";
import {
  fetchProfile,
  updateProfile,
  type AccountProfile,
  type UpdateProfilePayload,
} from "@/lib/api/account";
import type { UserGender, UserType } from "@/lib/api/auth";
import { GUEST_GENDER_LABELS, USER_TYPE_LABELS } from "@/lib/api/crm";
import { useAuthStore } from "@/stores/auth-store";

/** Every editable field, as strings, because that is what inputs hold. */
type FormState = Record<EditableField, string>;

type EditableField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "gender"
  | "dateOfBirth"
  | "userType"
  | "address"
  | "city"
  | "state"
  | "country"
  | "pincode";

const EDITABLE_FIELDS: EditableField[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "gender",
  "dateOfBirth",
  "userType",
  "address",
  "city",
  "state",
  "country",
  "pincode",
];

function toForm(profile: AccountProfile): FormState {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName ?? "",
    email: profile.email,
    phone: profile.phone,
    gender: profile.gender ?? "",
    dateOfBirth: profile.dateOfBirth ?? "",
    userType: profile.userType ?? "",
    address: profile.address ?? "",
    city: profile.city ?? "",
    state: profile.state ?? "",
    country: profile.country ?? "",
    pincode: profile.pincode ?? "",
  };
}

/**
 * Only what actually changed. Sending the whole form back would turn a
 * PATCH into a rewrite, and would make an untouched email collide with itself.
 */
function changedFields(
  form: FormState,
  original: FormState
): UpdateProfilePayload {
  const payload: UpdateProfilePayload = {};

  for (const field of EDITABLE_FIELDS) {
    if (form[field] === original[field]) continue;

    // A cleared select means "leave it unset", and the API rejects "" for an
    // enum — so those are simply not sent.
    if (form[field] === "" && (field === "gender" || field === "userType")) {
      continue;
    }

    if (field === "gender") {
      payload.gender = form.gender as UserGender;
    } else if (field === "userType") {
      payload.userType = form.userType as UserType;
    } else {
      payload[field] = form[field];
    }
  }

  return payload;
}

const fieldBox = "flex flex-col gap-2";

export function PersonalDetails() {
  const setUser = useAuthStore((state) => state.setUser);
  const sessionUser = useAuthStore((state) => state.user);

  const [form, setForm] = useState<FormState | null>(null);
  const [original, setOriginal] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [verified, setVerified] = useState({ email: false, phone: false });

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const response = await fetchProfile();
        if (!active) return;

        setForm(toForm(response.data));
        setOriginal(toForm(response.data));
        setVerified({
          email: response.data.isEmailVerified,
          phone: response.data.isPhoneVerified,
        });
      } catch (caught) {
        if (!active) return;
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Could not load your details. Please try again."
        );
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  function set(field: EditableField, value: string) {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form || !original) return;

    const payload = changedFields(form, original);

    if (Object.keys(payload).length === 0) {
      toast("Nothing to save yet.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await updateProfile(payload);
      const saved = response.data;

      setForm(toForm(saved));
      setOriginal(toForm(saved));
      setVerified({
        email: saved.isEmailVerified,
        phone: saved.isPhoneVerified,
      });

      // Keep the header in step with the name they just changed.
      setUser({
        id: saved.id,
        firstName: saved.firstName,
        lastName: saved.lastName,
        email: saved.email,
        phone: saved.phone,
        role: saved.role,
        userType: saved.userType,
        profileImage: saved.profileImage,
        lastLogin: sessionUser?.lastLogin ?? null,
      });

      toast.success("Details saved.");
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : "Could not save your details. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (error && !form) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <LoaderCircle className="size-7 animate-spin text-brand-ink" />
        <span className="sr-only">Loading your details</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <div className="rounded-3xl border bg-card p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold text-foreground">
          About you
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className={fieldBox}>
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(event) => set("firstName", event.target.value)}
              required
              minLength={2}
              maxLength={60}
              className="h-11 rounded-xl"
            />
          </div>

          <div className={fieldBox}>
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(event) => set("lastName", event.target.value)}
              maxLength={60}
              placeholder="Optional"
              className="h-11 rounded-xl"
            />
          </div>

          <div className={fieldBox}>
            <Label htmlFor="email">
              Email
              {verified.email && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <MailCheck className="size-3.5" /> Verified
                </span>
              )}
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => set("email", event.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className={fieldBox}>
            <Label htmlFor="phone">
              Phone
              {verified.phone && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <PhoneCall className="size-3.5" /> Verified
                </span>
              )}
            </Label>
            <Input
              id="phone"
              inputMode="tel"
              value={form.phone}
              onChange={(event) => set("phone", event.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className={fieldBox}>
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={form.gender || null}
              onValueChange={(value) => set("gender", (value as string) ?? "")}
            >
              <SelectTrigger id="gender" className="h-11 w-full rounded-xl">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GUEST_GENDER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={fieldBox}>
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={(event) => set("dateOfBirth", event.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <div className={`${fieldBox} sm:col-span-2`}>
            <Label htmlFor="userType">You are a</Label>
            <Select
              value={form.userType || null}
              onValueChange={(value) => set("userType", (value as string) ?? "")}
            >
              <SelectTrigger id="userType" className="h-11 w-full rounded-xl">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(USER_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border bg-card p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold text-foreground">
          Where you live
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className={`${fieldBox} sm:col-span-2`}>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(event) => set("address", event.target.value)}
              maxLength={500}
              className="h-11 rounded-xl"
            />
          </div>

          <div className={fieldBox}>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(event) => set("city", event.target.value)}
              maxLength={120}
              className="h-11 rounded-xl"
            />
          </div>

          <div className={fieldBox}>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={form.state}
              onChange={(event) => set("state", event.target.value)}
              maxLength={120}
              className="h-11 rounded-xl"
            />
          </div>

          <div className={fieldBox}>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={form.country}
              onChange={(event) => set("country", event.target.value)}
              maxLength={120}
              className="h-11 rounded-xl"
            />
          </div>

          <div className={fieldBox}>
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              inputMode="numeric"
              value={form.pincode}
              onChange={(event) => set("pincode", event.target.value)}
              maxLength={12}
              className="h-11 rounded-xl"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm font-medium text-destructive">{error}</p>
      )}

      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="h-12 gap-2 rounded-full px-7 text-base font-semibold"
        >
          {isSaving ? (
            <LoaderCircle className="size-4.5 animate-spin" />
          ) : (
            <Save className="size-4.5" />
          )}
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
