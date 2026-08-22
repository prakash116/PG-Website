"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ROOM_IMAGE_SLOTS,
  uploadRoomImage,
  type RoomImageSlot,
} from "@/lib/api/pg";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface RoomImageSlotsProps {
  /** Current URL per slot; empty string means the slot is still open. */
  values: Record<RoomImageSlot, string>;
  onChange: (slot: RoomImageSlot, url: string) => void;
  /** Prefixes input ids so several room types can render on one page. */
  idPrefix: string;
}

function Slot({
  slot,
  label,
  value,
  onChange,
  idPrefix,
}: {
  slot: RoomImageSlot;
  label: string;
  value: string;
  onChange: (slot: RoomImageSlot, url: string) => void;
  idPrefix: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = `${idPrefix}-${slot}`;

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please choose a JPEG, PNG or WebP image.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Please choose an image smaller than 5 MB.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setIsUploading(true);

    try {
      onChange(slot, await uploadRoomImage(file));
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not upload the photo."
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFile}
        className="sr-only"
      />

      <div
        className={cn(
          "group relative aspect-4/3 overflow-hidden rounded-xl border-2 border-dashed bg-card transition-colors",
          value ? "border-solid border-primary/40" : "hover:border-primary/40"
        )}
      >
        {value ? (
          <>
            {/* Remote Cloudinary URL, so a plain img avoids host config. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={label} className="size-full object-cover" />

            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                aria-label={`Replace ${label}`}
                className="flex size-8 items-center justify-center rounded-lg bg-card/95 shadow-sm hover:bg-card"
              >
                <ImagePlus className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onChange(slot, "")}
                aria-label={`Remove ${label}`}
                className="flex size-8 items-center justify-center rounded-lg bg-card/95 text-destructive shadow-sm hover:bg-card"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex size-full flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors hover:text-brand-ink"
          >
            {isUploading ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <ImagePlus className="size-5" />
            )}
            <span className="text-xs font-medium">
              {isUploading ? "Uploading..." : "Add photo"}
            </span>
          </button>
        )}
      </div>

      <label
        htmlFor={inputId}
        className="block cursor-pointer text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
    </div>
  );
}

/**
 * The four fixed photo slots on a room type. Keeping them per room type means a
 * listing card can show the right photo for the sharing type a visitor filtered
 * on, without another request.
 */
export function RoomImageSlots({
  values,
  onChange,
  idPrefix,
}: RoomImageSlotsProps) {
  const filled = ROOM_IMAGE_SLOTS.filter((slot) => values[slot.key]).length;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Photos</p>
        <p
          className={cn(
            "text-xs font-semibold",
            filled === ROOM_IMAGE_SLOTS.length
              ? "text-success"
              : "text-muted-foreground"
          )}
        >
          {filled} of {ROOM_IMAGE_SLOTS.length} photos
        </p>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ROOM_IMAGE_SLOTS.map((slot) => (
          <Slot
            key={slot.key}
            slot={slot.key}
            label={slot.label}
            value={values[slot.key]}
            onChange={onChange}
            idPrefix={idPrefix}
          />
        ))}
      </div>
    </div>
  );
}
