"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Check,
  ImagePlus,
  LoaderCircle,
  Star,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AMENITY_OPTIONS,
  COOLING_LABELS,
  PG_GENDER_LABELS,
  uploadPgImage,
  type Cooling,
  type PgDetail,
  type PgGender,
} from "@/lib/api/pg";
import { usePgStore } from "@/stores/pg-store";
import { PageHeader } from "../PageHeader";
import { PgLogoField } from "./PgLogoField";
import {
  NoPgState,
  PgErrorState,
  PgLoadingState,
  usePgOnce,
} from "./OverviewSection";

const MAX_PHOTOS = 12;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const digitsOnly = (value: string) => value.replace(/\D/g, "");

interface FormState {
  name: string;
  location: string;
  city: string;
  description: string;
  price: string;
  deposit: string;
  gender: PgGender | "";
  cooling: Cooling | "";
  foodIncluded: boolean;
  foodDetails: string;
  logo: string;
  amenities: string[];
  images: string[];
}

function toState(pg: PgDetail): FormState {
  return {
    name: pg.name,
    location: pg.location,
    city: pg.city ?? "",
    description: pg.description ?? "",
    price: pg.price === null ? "" : String(pg.price),
    deposit: pg.deposit === null ? "" : String(pg.deposit),
    gender: pg.gender ?? "",
    cooling: pg.cooling ?? "",
    foodIncluded: pg.foodIncluded,
    foodDetails: pg.foodDetails ?? "",
    logo: pg.logo ?? "",
    amenities: pg.amenities,
    images: pg.images,
  };
}

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-6">
      <h2 className="font-display text-base font-bold">{title}</h2>
      <p className="mt-0.5 text-[13px] text-muted-foreground">{hint}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Big tap targets beat a dropdown for a two-or-three-way choice. */
function ChoiceRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T | "";
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-11 rounded-full border px-5 text-sm font-semibold transition-all",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

const fieldBox = "space-y-2";
const inputStyle = "h-11 rounded-xl";

/** Loads the PG, then hands it to the form as a prop. */
export function PgInfoSection() {
  const { pg, isLoading, hasNoPg, error, load } = usePgOnce();

  if (isLoading && !pg) return <PgLoadingState />;
  if (hasNoPg) return <NoPgState />;
  if (error && !pg) return <PgErrorState message={error} onRetry={load} />;
  if (!pg) return null;

  // Keyed on updatedAt so a save elsewhere remounts the form with fresh
  // values, rather than syncing state inside an effect.
  return <PgInfoForm key={pg.updatedAt} pg={pg} />;
}

function PgInfoForm({ pg }: { pg: PgDetail }) {
  const [form, setForm] = useState<FormState>(() => toState(pg));
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSaving = usePgStore((state) => state.isSaving);
  const saveDetails = usePgStore((state) => state.saveDetails);

  const set = (patch: Partial<FormState>) =>
    setForm((previous) => ({ ...previous, ...patch }));

  function toggleAmenity(amenity: string) {
    set({
      amenities: form.amenities.includes(amenity)
        ? form.amenities.filter((entry) => entry !== amenity)
        : [...form.amenities, amenity],
    });
  }

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    if (form.images.length + files.length > MAX_PHOTOS) {
      toast.error(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }

    setIsUploading(true);

    try {
      for (const file of files) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          toast.error(`${file.name} is not a JPEG, PNG or WebP image.`);
          continue;
        }

        if (file.size > MAX_PHOTO_BYTES) {
          toast.error(`${file.name} is larger than 5 MB.`);
          continue;
        }

        const url = await uploadPgImage(file);
        setForm((previous) => ({ ...previous, images: [...previous.images, url] }));
      }
    } catch (uploadError: unknown) {
      toast.error(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload the photo."
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (form.name.trim().length < 2) {
      toast.error("Please enter your PG house name.");
      return;
    }

    if (!form.location.trim()) {
      toast.error("Please enter your PG location.");
      return;
    }

    try {
      await saveDetails({
        name: form.name.trim(),
        location: form.location.trim(),
        city: form.city.trim(),
        description: form.description.trim(),
        ...(form.price !== "" && { price: Number(form.price) }),
        ...(form.deposit !== "" && { deposit: Number(form.deposit) }),
        ...(form.gender && { gender: form.gender }),
        ...(form.cooling && { cooling: form.cooling }),
        amenities: form.amenities,
        foodIncluded: form.foodIncluded,
        foodDetails: form.foodIncluded ? form.foodDetails.trim() : "",
        logo: form.logo,
        images: form.images,
      });
      toast.success("PG details saved.");
    } catch (saveError: unknown) {
      toast.error(
        saveError instanceof Error ? saveError.message : "Could not save."
      );
    }
  }

  return (
    <>
      <PageHeader
        title="PG Info"
        description="Everything about your property, on one page. Save when you are done."
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
        className="grid gap-5 pb-24"
      >
        <Card title="Property" hint="Name and where it is.">
          <div className="grid gap-4">
            <div className={fieldBox}>
              <Label htmlFor="pg-name">PG house name</Label>
              <Input
                id="pg-name"
                value={form.name}
                onChange={(event) => set({ name: event.target.value })}
                maxLength={120}
                className={inputStyle}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={fieldBox}>
                <Label htmlFor="pg-location">Location</Label>
                <Input
                  id="pg-location"
                  value={form.location}
                  onChange={(event) => set({ location: event.target.value })}
                  placeholder="Building, street, area"
                  className={inputStyle}
                />
              </div>
              <div className={fieldBox}>
                <Label htmlFor="pg-city">City</Label>
                <Input
                  id="pg-city"
                  value={form.city}
                  onChange={(event) => set({ city: event.target.value })}
                  placeholder="New Delhi"
                  className={inputStyle}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Logo" hint="Your PG brand mark. Square images look best.">
          <PgLogoField
            value={form.logo}
            onChange={(logo) => set({ logo })}
          />
        </Card>

        <Card title="Who it is for" hint="Residents filter on this first.">
          <ChoiceRow
            options={(Object.keys(PG_GENDER_LABELS) as PgGender[]).map(
              (value) => ({ value, label: PG_GENDER_LABELS[value] })
            )}
            value={form.gender}
            onChange={(gender) => set({ gender })}
          />
        </Card>

        <Card title="Monthly budget" hint="What a resident pays to move in.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={fieldBox}>
              <Label htmlFor="pg-price">Starting rent (₹ / month)</Label>
              <Input
                id="pg-price"
                inputMode="numeric"
                value={form.price}
                onChange={(event) =>
                  set({ price: digitsOnly(event.target.value) })
                }
                placeholder="8500"
                className={inputStyle}
              />
            </div>
            <div className={fieldBox}>
              <Label htmlFor="pg-deposit">Security deposit (₹)</Label>
              <Input
                id="pg-deposit"
                inputMode="numeric"
                value={form.deposit}
                onChange={(event) =>
                  set({ deposit: digitsOnly(event.target.value) })
                }
                placeholder="15000"
                className={inputStyle}
              />
            </div>
          </div>
        </Card>

        <Card title="Cooling" hint="Whether rooms are air conditioned.">
          <ChoiceRow
            options={(Object.keys(COOLING_LABELS) as Cooling[]).map((value) => ({
              value,
              label: COOLING_LABELS[value],
            }))}
            value={form.cooling}
            onChange={(cooling) => set({ cooling })}
          />
        </Card>

        <Card title="Amenities" hint="Tap everything your PG includes.">
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((amenity) => {
              const selected = form.amenities.includes(amenity);

              return (
                <button
                  key={amenity}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleAmenity(amenity)}
                  className={cn(
                    "flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-all",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {selected && <Check className="size-3.5" strokeWidth={3} />}
                  {amenity}
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border bg-background p-4">
            <label className="flex cursor-pointer items-center gap-3">
              <Checkbox
                checked={form.foodIncluded}
                onCheckedChange={(checked) =>
                  set({ foodIncluded: checked === true })
                }
              />
              <span className="flex items-center gap-2 text-sm font-semibold">
                <UtensilsCrossed className="size-4 text-muted-foreground" />
                Meals are included in the rent
              </span>
            </label>

            {form.foodIncluded && (
              <Textarea
                value={form.foodDetails}
                onChange={(event) => set({ foodDetails: event.target.value })}
                placeholder="Breakfast, lunch and dinner. Veg and egg daily."
                rows={3}
                maxLength={1000}
                aria-label="What is served"
                className="mt-4 rounded-xl"
              />
            )}
          </div>
        </Card>

        <Card title="Photos" hint="Up to 12. The first one is the cover.">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            onChange={handleFiles}
            className="sr-only"
          />

          <Button
            type="button"
            variant="outline"
            disabled={isUploading || form.images.length >= MAX_PHOTOS}
            onClick={() => inputRef.current?.click()}
            className="h-11 rounded-full font-semibold"
          >
            {isUploading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            {isUploading ? "Uploading..." : "Add photos"}
          </Button>

          {form.images.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No photos yet. Listings with photos get far more enquiries.
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {form.images.map((url, index) => (
                <li
                  key={url}
                  className={cn(
                    "group relative aspect-4/3 overflow-hidden rounded-xl border bg-secondary",
                    index === 0 && "ring-2 ring-primary"
                  )}
                >
                  {/* Remote Cloudinary URL, so a plain img avoids host config. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`PG photo ${index + 1}`}
                    className="size-full object-cover"
                  />

                  {index === 0 && (
                    <span className="absolute top-1.5 left-1.5 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                      Cover
                    </span>
                  )}

                  <div className="absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          set({
                            images: [
                              url,
                              ...form.images.filter((entry) => entry !== url),
                            ],
                          })
                        }
                        aria-label="Use as cover photo"
                        className="flex size-8 items-center justify-center rounded-lg bg-card/95 shadow-sm hover:bg-card"
                      >
                        <Star className="size-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        set({
                          images: form.images.filter((entry) => entry !== url),
                        })
                      }
                      aria-label="Remove photo"
                      className="flex size-8 items-center justify-center rounded-lg bg-card/95 text-destructive shadow-sm hover:bg-card"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Description" hint="A few lines about living there.">
          <Textarea
            value={form.description}
            onChange={(event) => set({ description: event.target.value })}
            placeholder="What makes your PG a good place to live?"
            rows={4}
            maxLength={2000}
            aria-label="Description"
            className="rounded-xl"
          />
        </Card>

        {/* Sticky so Save is always reachable on a long form. */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 p-4 backdrop-blur-sm lg:left-64">
          <div className="mx-auto flex max-w-5xl items-center justify-end gap-3">
            <p className="mr-auto hidden text-[13px] text-muted-foreground sm:block">
              Changes are saved only when you press Save.
            </p>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-11 rounded-full px-7 font-semibold"
            >
              {isSaving && <LoaderCircle className="size-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
