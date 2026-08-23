"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  Home,
  ImagePlus,
  LoaderCircle,
  Trash2,
  UserRound,
} from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { DeleteAccountDialog } from "@/components/account/DeleteAccountDialog";
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
import { uploadProfileImage, type UserGender, type UserRole, type UserType } from "@/lib/api/auth";
import { GUEST_GENDER_LABELS, USER_TYPE_LABELS } from "@/lib/api/crm";
import { useAuthStore } from "@/stores/auth-store";

type EditableField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "gender"
  | "dateOfBirth"
  | "userType"
  | "profileImage"
  | "address"
  | "city"
  | "state"
  | "country"
  | "pincode";

/** Every editable field as a string, because that is what inputs hold. */
type FormState = Record<EditableField, string>;

const EDITABLE_FIELDS: EditableField[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "gender",
  "dateOfBirth",
  "userType",
  "profileImage",
  "address",
  "city",
  "state",
  "country",
  "pincode",
];

/** What each role is called to the person who holds it. */
const ROLE_LABELS: Record<UserRole, string> = {
  USER: "Resident",
  PG_OWNER: "PG owner",
  SUPER_ADMIN: "Super admin",
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function toForm(profile: AccountProfile): FormState {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName ?? "",
    email: profile.email,
    phone: profile.phone,
    gender: profile.gender ?? "",
    dateOfBirth: profile.dateOfBirth ?? "",
    userType: profile.userType ?? "",
    profileImage: profile.profileImage ?? "",
    address: profile.address ?? "",
    city: profile.city ?? "",
    state: profile.state ?? "",
    country: profile.country ?? "",
    pincode: profile.pincode ?? "",
  };
}

/**
 * Only what actually changed. Sending the whole form back would turn a PATCH
 * into a rewrite, and would make an untouched email collide with itself.
 */
function changedFields(form: FormState, saved: FormState): UpdateProfilePayload {
  const payload: UpdateProfilePayload = {};

  for (const field of EDITABLE_FIELDS) {
    if (form[field] === saved[field]) continue;

    // A cleared dropdown means "leave it unset", and the API rejects "" for an
    // enum — so those are simply not sent. An empty photo, by contrast, is a
    // real instruction: remove it.
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

function memberSince(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

const fieldBox = "flex flex-col gap-2";
const inputClass = "h-11 rounded-xl";
const cardClass = "rounded-3xl border bg-card p-6 sm:p-7";

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function PersonalDetails() {
  const setUser = useAuthStore((state) => state.setUser);
  const sessionUser = useAuthStore((state) => state.user);

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const response = await fetchProfile();
        if (!active) return;

        setProfile(response.data);
        setForm(toForm(response.data));
      } catch (caught) {
        if (!active) return;
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Could not load your details. Try again."
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

  const saved = profile ? toForm(profile) : null;
  const changes = form && saved ? changedFields(form, saved) : {};
  const isDirty = Object.keys(changes).length > 0;

  async function handlePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reset = () => {
      if (photoInputRef.current) photoInputRef.current.value = "";
    };

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Choose a JPEG, PNG or WebP image.");
      reset();
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Choose an image smaller than 5 MB.");
      reset();
      return;
    }

    setIsUploading(true);

    try {
      set("profileImage", await uploadProfileImage(file));
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Could not upload the photo."
      );
    } finally {
      setIsUploading(false);
      reset();
    }
  }

  function discard() {
    if (saved) setForm(saved);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form || !isDirty) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await updateProfile(changes);
      const next = response.data;

      setProfile(next);
      setForm(toForm(next));

      // Keep the header in step with the name and photo just changed.
      setUser({
        id: next.id,
        firstName: next.firstName,
        lastName: next.lastName,
        email: next.email,
        phone: next.phone,
        role: next.role,
        userType: next.userType,
        profileImage: next.profileImage,
        lastLogin: sessionUser?.lastLogin ?? null,
      });

      toast.success("Details saved.");
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : "Could not save your details. Try again.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (error && !form) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  if (!form || !profile) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <LoaderCircle className="size-7 animate-spin text-brand-ink" />
        <span className="sr-only">Loading your details</span>
      </div>
    );
  }

  const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ");

  return (
    <form
      onSubmit={handleSubmit}
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]"
    >
      {/* Who you are. The one warm panel on the page; everything else is quiet. */}
      <aside className="rounded-3xl border bg-gradient-to-b from-accent to-card p-6 text-center lg:sticky lg:top-28">
        <input
          ref={photoInputRef}
          id="profilePhoto"
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handlePhoto}
          className="sr-only"
        />

        <UserAvatar
          src={form.profileImage || null}
          name={fullName}
          className="mx-auto size-24 border-4 border-card text-2xl shadow-sm"
        />

        <p className="mt-4 font-display text-xl font-bold text-foreground">
          {fullName || "Your name"}
        </p>
        <p className="truncate text-sm text-muted-foreground">{form.email}</p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-foreground">
            {ROLE_LABELS[profile.role]}
          </span>
          {profile.isEmailVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              <BadgeCheck className="size-3.5" />
              Email
            </span>
          )}
          {profile.isPhoneVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              <BadgeCheck className="size-3.5" />
              Phone
            </span>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => photoInputRef.current?.click()}
            className="h-11 gap-2 rounded-full bg-card font-semibold"
          >
            {isUploading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            {isUploading
              ? "Uploading..."
              : form.profileImage
                ? "Change photo"
                : "Add photo"}
          </Button>

          {form.profileImage && !isUploading && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => set("profileImage", "")}
              className="h-10 gap-2 rounded-full font-semibold text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Remove photo
            </Button>
          )}
        </div>

        <p className="mt-5 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          With Pzee since {memberSince(profile.createdAt)}
        </p>
      </aside>

      <div>
        <div className={cardClass}>
          <SectionHeading
            icon={UserRound}
            title="About you"
            description="Your PG owner sees the name and number you keep here."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className={fieldBox}>
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(event) => set("firstName", event.target.value)}
                required
                minLength={2}
                maxLength={60}
                className={inputClass}
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
                className={inputClass}
              />
            </div>

            <div className={fieldBox}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => set("email", event.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div className={fieldBox}>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                inputMode="tel"
                value={form.phone}
                onChange={(event) => set("phone", event.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div className={fieldBox}>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={form.gender || null}
                onValueChange={(value) => set("gender", (value as string) ?? "")}
              >
                <SelectTrigger id="gender" className={`${inputClass} w-full`}>
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
                className={inputClass}
              />
            </div>

            <div className={`${fieldBox} sm:col-span-2`}>
              <Label htmlFor="userType">You are a</Label>
              <Select
                value={form.userType || null}
                onValueChange={(value) =>
                  set("userType", (value as string) ?? "")
                }
              >
                <SelectTrigger id="userType" className={`${inputClass} w-full`}>
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

        <div className={`${cardClass} mt-5`}>
          <SectionHeading
            icon={Home}
            title="Where you live"
            description="Your home address, not your PG — that one lives under My PG."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className={`${fieldBox} sm:col-span-2`}>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(event) => set("address", event.target.value)}
                maxLength={500}
                className={inputClass}
              />
            </div>

            <div className={fieldBox}>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(event) => set("city", event.target.value)}
                maxLength={120}
                className={inputClass}
              />
            </div>

            <div className={fieldBox}>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={form.state}
                onChange={(event) => set("state", event.target.value)}
                maxLength={120}
                className={inputClass}
              />
            </div>

            <div className={fieldBox}>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(event) => set("country", event.target.value)}
                maxLength={120}
                className={inputClass}
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
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Deleting is separated from saving, and styled so it can never be
            mistaken for one of the form's own actions. */}
        <div className="mt-5 rounded-3xl border border-destructive/25 bg-destructive/[0.03] p-6 sm:p-7">
          <h2 className="font-display text-lg font-bold text-foreground">
            Delete account
          </h2>

          {profile.role === "USER" ? (
            <>
              <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
                Signs you out and closes your account. We hold it for 30 days in
                case you change your mind, then delete it for good.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteOpen(true)}
                className="mt-5 h-11 gap-2 rounded-full border-destructive/40 bg-card font-semibold text-destructive hover:bg-destructive/5 hover:text-destructive"
              >
                <Trash2 className="size-4" />
                Delete account
              </Button>
            </>
          ) : (
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
              A PG owner account cannot be deleted here — removing it would take
              the PG with it, along with its rooms, residents and payment
              history. Remove the PG first, or ask an administrator.
            </p>
          )}
        </div>

        <DeleteAccountDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          email={profile.email}
        />

        {error && (
          <p className="mt-4 text-sm font-medium text-destructive">{error}</p>
        )}

        {/* Appears only when there is something to save, and follows you down
            the page so Save is never a scroll away. */}
        {isDirty && (
          <div className="sticky bottom-4 z-10 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/95 p-3 pl-5 shadow-lg backdrop-blur-sm">
            <p className="text-sm font-semibold text-foreground">
              Unsaved changes
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={isSaving}
                onClick={discard}
                className="h-11 rounded-full px-5 font-semibold text-muted-foreground"
              >
                Discard
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="h-11 gap-2 rounded-full px-6 font-semibold"
              >
                {isSaving && <LoaderCircle className="size-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
