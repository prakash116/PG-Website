"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { ImagePlus, Send, X } from "lucide-react";
import type { Gender } from "@/lib/types";
import { AMENITY_ICONS } from "@/components/pg/Amenities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CITIES = ["Delhi", "Gurugram", "Noida", "Bengaluru", "Pune", "Mumbai", "Other"];
const GENDERS: Gender[] = ["Boys", "Girls", "Co-Living"];
const AMENITY_OPTIONS = Object.keys(AMENITY_ICONS);

interface FormState {
  ownerName: string;
  mobile: string;
  email: string;
  pgName: string;
  city: string | null;
  area: string;
  address: string;
  gender: Gender | null;
  rent: string;
  rooms: string;
  beds: string;
  description: string;
}

const INITIAL_STATE: FormState = {
  ownerName: "",
  mobile: "",
  email: "",
  pgName: "",
  city: null,
  area: "",
  address: "",
  gender: null,
  rent: "",
  rooms: "",
  beds: "",
  description: "",
};

export function ListPropertyForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  function toggleAmenity(name: string) {
    setAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  }

  function handleFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [
      ...prev,
      ...Array.from(list).map((file) => file.name),
    ]);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.ownerName.trim()) return void toast.error("Please enter the owner's name.");
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim()))
      return void toast.error("Please enter a valid 10-digit mobile number.");
    if (!form.email.includes("@"))
      return void toast.error("Please enter a valid email address.");
    if (!form.pgName.trim()) return void toast.error("Please enter your PG name.");
    if (!form.city) return void toast.error("Please select your city.");
    if (!form.address.trim())
      return void toast.error("Please enter the complete address.");
    if (!form.gender) return void toast.error("Please choose a PG type.");
    if (!form.rent || Number(form.rent) <= 0)
      return void toast.error("Please enter the monthly starting rent.");

    toast.success(
      "Property submitted! Our team will verify the details and reach out within 24 hours.",
      { duration: 4500 }
    );
    setForm(INITIAL_STATE);
    setAmenities([]);
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const fieldBox = "space-y-2";
  const inputStyle = "h-12 rounded-xl";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border bg-card p-6 shadow-[0_8px_32px_rgb(38_22_10/0.06)] sm:p-8"
    >
      {/* Owner details */}
      <h2 className="font-display text-lg font-bold">Owner details</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className={fieldBox}>
          <Label htmlFor="owner-name">Owner Name *</Label>
          <Input
            id="owner-name"
            value={form.ownerName}
            onChange={(e) => set({ ownerName: e.target.value })}
            placeholder="Full name"
            autoComplete="name"
            className={inputStyle}
          />
        </div>
        <div className={fieldBox}>
          <Label htmlFor="owner-mobile">Mobile Number *</Label>
          <Input
            id="owner-mobile"
            type="tel"
            inputMode="numeric"
            value={form.mobile}
            onChange={(e) =>
              set({ mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })
            }
            placeholder="10-digit mobile number"
            autoComplete="tel"
            className={inputStyle}
          />
        </div>
        <div className={cn(fieldBox, "sm:col-span-2")}>
          <Label htmlFor="owner-email">Email *</Label>
          <Input
            id="owner-email"
            type="email"
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            placeholder="you@example.com"
            autoComplete="email"
            className={inputStyle}
          />
        </div>
      </div>

      {/* Property details */}
      <h2 className="mt-9 font-display text-lg font-bold">Property details</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className={fieldBox}>
          <Label htmlFor="pg-name">PG Name *</Label>
          <Input
            id="pg-name"
            value={form.pgName}
            onChange={(e) => set({ pgName: e.target.value })}
            placeholder="e.g. Urban Nest PG"
            className={inputStyle}
          />
        </div>
        <div className={fieldBox}>
          <Label htmlFor="pg-city">City *</Label>
          <Select
            value={form.city}
            onValueChange={(value) => set({ city: value as string | null })}
          >
            <SelectTrigger id="pg-city" className="h-12 w-full rounded-xl">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className={fieldBox}>
          <Label htmlFor="pg-area">Area / Locality</Label>
          <Input
            id="pg-area"
            value={form.area}
            onChange={(e) => set({ area: e.target.value })}
            placeholder="e.g. Sector 14"
            className={inputStyle}
          />
        </div>
        <div className={fieldBox}>
          <Label htmlFor="pg-rent">Monthly Starting Rent (₹) *</Label>
          <Input
            id="pg-rent"
            type="number"
            min={1000}
            value={form.rent}
            onChange={(e) => set({ rent: e.target.value })}
            placeholder="e.g. 8500"
            className={inputStyle}
          />
        </div>
        <div className={cn(fieldBox, "sm:col-span-2")}>
          <Label htmlFor="pg-address">Complete Address *</Label>
          <Textarea
            id="pg-address"
            value={form.address}
            onChange={(e) => set({ address: e.target.value })}
            placeholder="House number, street, landmark, pincode"
            rows={3}
            className="rounded-xl"
          />
        </div>
        <div className={fieldBox}>
          <Label htmlFor="pg-rooms">Number of Rooms</Label>
          <Input
            id="pg-rooms"
            type="number"
            min={1}
            value={form.rooms}
            onChange={(e) => set({ rooms: e.target.value })}
            placeholder="e.g. 12"
            className={inputStyle}
          />
        </div>
        <div className={fieldBox}>
          <Label htmlFor="pg-beds">Available Beds</Label>
          <Input
            id="pg-beds"
            type="number"
            min={0}
            value={form.beds}
            onChange={(e) => set({ beds: e.target.value })}
            placeholder="e.g. 8"
            className={inputStyle}
          />
        </div>
      </div>

      {/* PG type */}
      <div className="mt-6">
        <Label className="mb-3 block">PG Type *</Label>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((gender) => (
            <button
              key={gender}
              type="button"
              onClick={() => set({ gender })}
              aria-pressed={form.gender === gender}
              className={cn(
                "rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
                form.gender === gender
                  ? "border-saffron-600 bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mt-6">
        <Label className="mb-3 block">Amenities</Label>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((name) => {
            const Icon = AMENITY_ICONS[name];
            const active = amenities.includes(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleAmenity(name)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                  active
                    ? "border-primary bg-accent text-accent-foreground"
                    : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="mt-6 space-y-2">
        <Label htmlFor="pg-description">Property Description</Label>
        <Textarea
          id="pg-description"
          value={form.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="Tell residents what makes your property special — food, vibe, nearby places…"
          rows={4}
          className="rounded-xl"
        />
      </div>

      {/* Images */}
      <div className="mt-6">
        <Label htmlFor="pg-images" className="mb-3 block">
          Upload Images
        </Label>
        <label
          htmlFor="pg-images"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-secondary/50 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-accent/40"
        >
          <ImagePlus className="size-8 text-brand-ink" />
          <span className="text-sm font-semibold text-foreground">
            Click to upload photos
          </span>
          <span className="text-xs text-muted-foreground">
            Rooms, common areas, exterior — JPG or PNG
          </span>
          <input
            ref={fileInputRef}
            id="pg-images"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="sr-only"
          />
        </label>
        {files.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {files.map((name, i) => (
              <li
                key={`${name}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
              >
                {name}
                <button
                  type="button"
                  aria-label={`Remove ${name}`}
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button
        type="submit"
        className="mt-8 h-13 w-full rounded-full text-base font-semibold"
      >
        <Send className="size-4.5" data-icon="inline-start" />
        Submit Property
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Free to list · Our team verifies every property before it goes live
      </p>
    </form>
  );
}
