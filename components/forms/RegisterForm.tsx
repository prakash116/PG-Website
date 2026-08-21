"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  Lock,
  MapPin,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  uploadProfileImage,
  type RegistrationRole,
  type RegisterPayload,
  type UserGender,
  type UserType,
} from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";

interface RegisterFormState {
  role: RegistrationRole;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  // "Find a PG" only
  address: string;
  dateOfBirth: string;
  userType: UserType | "";
  gender: UserGender | "";
  // "List a PG" only
  pgName: string;
  pgLocation: string;
}

const INITIAL_FORM: RegisterFormState = {
  role: "USER",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  address: "",
  dateOfBirth: "",
  userType: "",
  gender: "",
  pgName: "",
  pgLocation: "",
};

const ROLE_OPTIONS: Array<{
  value: RegistrationRole;
  label: string;
  description: string;
  icon: typeof Search;
}> = [
  {
    value: "USER",
    label: "Find a PG",
    description: "Search verified PGs and book visits.",
    icon: Search,
  },
  {
    value: "PG_OWNER",
    label: "List & manage a PG",
    description: "Publish your property and handle enquiries.",
    icon: Building2,
  },
];

const USER_TYPE_OPTIONS: Array<{ value: UserType; label: string }> = [
  { value: "STUDENT", label: "Student" },
  { value: "TOURIST", label: "Tourist" },
  { value: "WORKING_PROFESSIONAL", label: "Working professional" },
  { value: "EMPLOYEE", label: "Employee" },
  { value: "OTHER", label: "Other" },
];

const GENDER_OPTIONS: Array<{ value: UserGender; label: string }> = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const PASSWORD_RULES: Array<{ label: string; test: (value: string) => boolean }> =
  [
    { label: "8+ characters", test: (value) => value.length >= 8 },
    { label: "Uppercase", test: (value) => /[A-Z]/.test(value) },
    { label: "Lowercase", test: (value) => /[a-z]/.test(value) },
    { label: "Number", test: (value) => /\d/.test(value) },
    { label: "Special character", test: (value) => /[^A-Za-z0-9]/.test(value) },
  ];

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

/** Mirrors the API limit, so an oversized file fails before the round trip. */
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

function validateForm(form: RegisterFormState): string | null {
  const fullName = form.fullName.trim();

  if (fullName.length < 2 || fullName.length > 100) {
    return "Please enter your full name.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return "Please enter a valid email address.";
  }

  if (!/^[6-9]\d{9}$/.test(form.phone)) {
    return "Please enter a valid 10-digit mobile number.";
  }

  if (!PASSWORD_PATTERN.test(form.password)) {
    return "Password must have 8 characters, uppercase, lowercase, number and special character.";
  }

  if (form.password !== form.confirmPassword) {
    return "Passwords do not match.";
  }

  if (form.role === "USER") {
    if (!form.address.trim()) {
      return "Please enter your address.";
    }

    if (!form.dateOfBirth) {
      return "Please enter your date of birth.";
    }

    if (new Date(form.dateOfBirth) >= new Date()) {
      return "Date of birth must be in the past.";
    }

    return null;
  }

  if (form.pgName.trim().length < 2) {
    return "Please enter your PG house name.";
  }

  if (!form.pgLocation.trim()) {
    return "Please enter your PG location.";
  }

  return null;
}

function createPayload(
  form: RegisterFormState,
  profileImage: string | null
): RegisterPayload {
  const shared = {
    fullName: form.fullName.trim().replace(/\s+/g, " "),
    email: form.email.trim().toLowerCase(),
    phone: form.phone,
    password: form.password,
    ...(profileImage && { profileImage }),
  };

  if (form.role === "PG_OWNER") {
    return {
      ...shared,
      role: "PG_OWNER",
      pgName: form.pgName.trim(),
      pgLocation: form.pgLocation.trim(),
    };
  }

  return {
    ...shared,
    role: "USER",
    address: form.address.trim(),
    dateOfBirth: form.dateOfBirth,
    ...(form.userType && { userType: form.userType }),
    ...(form.gender && { gender: form.gender }),
  };
}

/** Numbered heading that opens each block of the form. */
function SectionHeading({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent font-display text-[13px] font-extrabold text-accent-foreground">
        {step}
      </span>
      <div className="pt-0.5">
        <h3 className="font-display text-base font-bold text-foreground">
          {title}
        </h3>
        <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

/** Required-field marker, kept saffron for a consistent scan line. */
function Req() {
  return (
    <span aria-hidden="true" className="text-brand-ink">
      *
    </span>
  );
}

export function RegisterForm() {
  const [form, setForm] = useState<RegisterFormState>(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [copied, setCopied] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const isRegistering = useAuthStore((state) => state.isRegistering);
  const registration = useAuthStore((state) => state.registration);
  const error = useAuthStore((state) => state.error);
  const register = useAuthStore((state) => state.register);
  const clearError = useAuthStore((state) => state.clearError);
  const resetRegistration = useAuthStore((state) => state.resetRegistration);

  const isOwner = form.role === "PG_OWNER";

  // Object URLs leak until they are revoked.
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function set(patch: Partial<RegisterFormState>) {
    setForm((previous) => ({ ...previous, ...patch }));
    if (error) clearError();
  }

  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setPhotoUrl(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  /** Uploaded as soon as it is picked, so submitting only sends a URL. */
  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      toast.error("Please choose a JPEG, PNG or WebP image.");
      clearPhoto();
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Please choose an image smaller than 5 MB.");
      clearPhoto();
      return;
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
    setIsUploadingPhoto(true);

    try {
      setPhotoUrl(await uploadProfileImage(file));
    } catch (uploadError: unknown) {
      toast.error(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload the photo. Please try again."
      );
      clearPhoto();
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function copyPgCode(pgCode: string) {
    try {
      await navigator.clipboard.writeText(pgCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Please copy the ID manually.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm(form);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (isUploadingPhoto) {
      toast.error("Please wait for the photo to finish uploading.");
      return;
    }

    try {
      const response = await register(createPayload(form, photoUrl));
      setForm(INITIAL_FORM);
      clearPhoto();
      toast.success(response.message);
    } catch (requestError: unknown) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Registration failed. Please try again."
      );
    }
  }

  if (registration) {
    const registered = registration.data;
    const pg = registered.pg;

    return (
      <div
        role="status"
        className="rounded-3xl border border-success/30 bg-success/10 px-6 py-12 text-center sm:px-10"
      >
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-success/15">
          <CheckCircle2 className="size-9 text-success" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold">Account created</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {registered.firstName}, your account for{" "}
          <span className="font-semibold text-foreground">
            {registered.email}
          </span>{" "}
          is ready and you are signed in.
        </p>

        {pg && (
          <div className="mx-auto mt-7 max-w-sm rounded-2xl border bg-card p-5 text-left">
            <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
              Your PG ID
            </p>
            <div className="mt-2.5 flex items-center gap-3">
              <code className="flex-1 rounded-xl bg-secondary px-3.5 py-2.5 font-display text-lg font-extrabold tracking-wider text-brand-ink">
                {pg.pgCode}
              </code>
              <Button
                type="button"
                variant="outline"
                onClick={() => copyPgCode(pg.pgCode)}
                aria-label="Copy PG ID"
                className="size-11 shrink-0 rounded-xl p-0"
              >
                {copied ? (
                  <Check className="size-4 text-success" strokeWidth={3} />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              Share this ID so residents and our team can find{" "}
              <span className="font-semibold text-foreground">{pg.name}</span>.
              Keep it safe — it identifies your property across Pzee.
            </p>
          </div>
        )}

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            render={
              <Link href={pg ? "/pg-owner/dashboard" : "/pg"} />
            }
            className="h-11 rounded-full px-6 font-semibold"
          >
            {pg ? "Go to dashboard" : "Browse PGs"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetRegistration}
            className="h-11 rounded-full px-6 font-semibold"
          >
            Register another account
          </Button>
        </div>
      </div>
    );
  }

  const sectionBox =
    "rounded-3xl border border-border/70 bg-secondary/35 p-5 sm:p-6";
  const gridBox = "mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5";
  const fieldBox = "space-y-2";
  const inputStyle = "h-12 rounded-xl bg-card";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* 01 — Account type */}
      <section className={sectionBox}>
        <SectionHeading
          step="01"
          title="Account type"
          description="Tell us how you plan to use Pzee."
        />

        <fieldset className="mt-5">
          <legend className="sr-only">I want to</legend>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {ROLE_OPTIONS.map((option) => {
              const selected = form.role === option.value;
              return (
                <label
                  key={option.value}
                  className={cn(
                    "group relative flex cursor-pointer gap-3.5 rounded-2xl border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-[0_10px_28px_rgb(38_22_10/0.06)]",
                    selected
                      ? "border-primary bg-accent/50 shadow-[0_10px_28px_rgb(38_22_10/0.07)]"
                      : "border-border"
                  )}
                >
                  <input
                    type="radio"
                    name="register-role"
                    value={option.value}
                    checked={selected}
                    onChange={() => set({ role: option.value })}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                    )}
                  >
                    <option.icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-foreground">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-3 right-3 flex size-5 items-center justify-center rounded-full border transition-all",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-transparent"
                    )}
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Only a resident describes themselves this way. */}
        {!isOwner && (
          <fieldset className="mt-5">
            <legend className="mb-2.5 text-sm font-medium text-foreground">
              You are
            </legend>
            <div className="flex flex-wrap gap-2">
              {USER_TYPE_OPTIONS.map((option) => {
                const selected = form.userType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      set({ userType: selected ? "" : option.value })
                    }
                    className={cn(
                      "h-10 rounded-full border px-4 text-sm font-medium transition-all",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}
      </section>

      {/* 02 — Contact details */}
      <section className={sectionBox}>
        <SectionHeading
          step="02"
          title={isOwner ? "Owner details" : "Your details"}
          description={
            isOwner
              ? "How residents and our team will reach you."
              : "How PG owners and our team will reach you."
          }
        />
        <div className={gridBox}>
          <div className={cn(fieldBox, "sm:col-span-2")}>
            <Label htmlFor="register-full-name">
              {isOwner ? "Owner name" : "Full name"} <Req />
            </Label>
            <Input
              id="register-full-name"
              value={form.fullName}
              onChange={(event) => set({ fullName: event.target.value })}
              placeholder="Ananya Sharma"
              autoComplete="name"
              maxLength={100}
              className={inputStyle}
            />
          </div>
          <div className={fieldBox}>
            <Label htmlFor="register-email">
              Email <Req />
            </Label>
            <Input
              id="register-email"
              type="email"
              value={form.email}
              onChange={(event) => set({ email: event.target.value })}
              placeholder="you@example.com"
              autoComplete="email"
              className={inputStyle}
            />
          </div>
          <div className={fieldBox}>
            <Label htmlFor="register-phone">
              Mobile number <Req />
            </Label>
            <div className="flex h-12 overflow-hidden rounded-xl border bg-card focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <span className="flex items-center border-r bg-secondary px-3.5 text-sm font-semibold text-secondary-foreground">
                +91
              </span>
              <Input
                id="register-phone"
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(event) =>
                  set({
                    phone: event.target.value.replace(/\D/g, "").slice(0, 10),
                  })
                }
                placeholder="98765 43210"
                autoComplete="tel-national"
                className="h-full flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0"
              />
            </div>
          </div>

          {!isOwner && (
            <>
              <div className={fieldBox}>
                <Label htmlFor="register-date-of-birth">
                  Date of birth <Req />
                </Label>
                <Input
                  id="register-date-of-birth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(event) => set({ dateOfBirth: event.target.value })}
                  autoComplete="bday"
                  className={inputStyle}
                />
              </div>
              <div className={fieldBox}>
                <Label htmlFor="register-gender">Gender</Label>
                <Select
                  value={form.gender || null}
                  onValueChange={(value) =>
                    set({ gender: (value as UserGender | null) ?? "" })
                  }
                >
                  <SelectTrigger
                    id="register-gender"
                    className="h-12 w-full rounded-xl bg-card"
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="register-address">
                  Address <Req />
                </Label>
                <Textarea
                  id="register-address"
                  value={form.address}
                  onChange={(event) => set({ address: event.target.value })}
                  placeholder="House / flat number, street, area, city"
                  autoComplete="street-address"
                  rows={3}
                  className="rounded-xl bg-card"
                />
              </div>
            </>
          )}
        </div>
      </section>

      {/* 03 — PG details, owners only */}
      {isOwner && (
        <section className={sectionBox}>
          <SectionHeading
            step="03"
            title="PG details"
            description="We create your PG and give it a unique PG ID."
          />
          <div className={gridBox}>
            <div className={cn(fieldBox, "sm:col-span-2")}>
              <Label htmlFor="register-pg-name">
                PG house name <Req />
              </Label>
              <Input
                id="register-pg-name"
                value={form.pgName}
                onChange={(event) => set({ pgName: event.target.value })}
                placeholder="Sunrise Boys PG"
                maxLength={120}
                className={inputStyle}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="register-pg-location">
                PG location <Req />
              </Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-muted-foreground" />
                <Textarea
                  id="register-pg-location"
                  value={form.pgLocation}
                  onChange={(event) => set({ pgLocation: event.target.value })}
                  placeholder="Building, street, area, city and pincode"
                  rows={3}
                  className="rounded-xl bg-card pl-10"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Profile photo — optional for both roles */}
      <section className={sectionBox}>
        <SectionHeading
          step={isOwner ? "04" : "03"}
          title="Profile photo"
          description="Optional. JPEG, PNG or WebP, up to 5 MB."
        />
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-card">
            {photoPreview ? (
              // Local object URL preview; next/image is not useful for a blob.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreview}
                alt="Profile photo preview"
                className="size-full object-cover"
              />
            ) : (
              <ImagePlus className="size-6 text-muted-foreground" />
            )}
          </span>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              ref={photoInputRef}
              id="register-photo"
              type="file"
              accept={ACCEPTED_PHOTO_TYPES.join(",")}
              onChange={handlePhotoChange}
              className="sr-only"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isUploadingPhoto}
              onClick={() => photoInputRef.current?.click()}
              className="h-11 rounded-full px-5 font-semibold"
            >
              {isUploadingPhoto ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              {isUploadingPhoto
                ? "Uploading..."
                : photoUrl
                  ? "Change photo"
                  : "Choose photo"}
            </Button>

            {photoUrl && !isUploadingPhoto && (
              <Button
                type="button"
                variant="ghost"
                onClick={clearPhoto}
                className="h-11 rounded-full px-4 font-semibold text-muted-foreground"
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            )}

            {photoUrl && !isUploadingPhoto && (
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-success">
                <Check className="size-4" strokeWidth={3} />
                Photo uploaded
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Password */}
      <section className={sectionBox}>
        <SectionHeading
          step={isOwner ? "05" : "04"}
          title="Secure your account"
          description="Pick a password you don't use anywhere else."
        />
        <div className={gridBox}>
          <div className={fieldBox}>
            <Label htmlFor="register-password">
              Password <Req />
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) => set({ password: event.target.value })}
                autoComplete="new-password"
                className="h-12 rounded-xl bg-card px-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
          <div className={fieldBox}>
            <Label htmlFor="register-confirm-password">
              Confirm password <Req />
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="register-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(event) =>
                  set({ confirmPassword: event.target.value })
                }
                autoComplete="new-password"
                className="h-12 rounded-xl bg-card px-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live requirement checklist */}
        <ul className="mt-4 flex flex-wrap gap-2">
          {PASSWORD_RULES.map((rule) => {
            const met = rule.test(form.password);
            return (
              <li
                key={rule.label}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  met
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                <Check
                  className={cn("size-3.5", !met && "opacity-40")}
                  strokeWidth={3}
                />
                {rule.label}
              </li>
            );
          })}
        </ul>
        {form.confirmPassword.length > 0 &&
          form.password !== form.confirmPassword && (
            <p className="mt-3 text-xs font-medium text-destructive">
              Both passwords must match.
            </p>
          )}
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-secondary/35 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
          By creating an account you agree to our terms of use and privacy
          policy.
        </p>
        <Button
          type="submit"
          disabled={isRegistering || isUploadingPhoto}
          className="h-12 w-full shrink-0 rounded-full px-8 text-[15px] font-semibold sm:w-auto"
        >
          {isRegistering ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
          {isRegistering ? "Creating account..." : "Create account"}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground sm:hidden">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-ink hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
