"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { ImagePlus, LoaderCircle, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadPgImage, type PgDetail } from "@/lib/api/pg";
import { usePgStore } from "@/stores/pg-store";
import { EditorDialog } from "./EditorDialog";

interface PgPhotosFormProps {
  pg: PgDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_PHOTOS = 12;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function PgPhotosForm({ pg, open, onOpenChange }: PgPhotosFormProps) {
  const [images, setImages] = useState<string[]>(pg.images);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSaving = usePgStore((state) => state.isSaving);
  const saveDetails = usePgStore((state) => state.saveDetails);

  function handleOpenChange(next: boolean) {
    if (!next) setImages(pg.images);
    onOpenChange(next);
  }

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    if (images.length + files.length > MAX_PHOTOS) {
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
        setImages((previous) => [...previous, url]);
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not upload the photo."
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  /** The first photo is the one listing cards show. */
  function makeCover(url: string) {
    setImages((previous) => [url, ...previous.filter((entry) => entry !== url)]);
  }

  function remove(url: string) {
    setImages((previous) => previous.filter((entry) => entry !== url));
  }

  async function handleSave() {
    try {
      await saveDetails({ images });
      toast.success("Photos saved.");
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
    }
  }

  return (
    <EditorDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Photos"
      description="Up to 12 photos. The first one is used as the cover."
      isSaving={isSaving}
      onSave={handleSave}
    >
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
        disabled={isUploading || images.length >= MAX_PHOTOS}
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

      {images.length === 0 ? (
        <p className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          No photos yet. Listings with photos get far more enquiries.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((url, index) => (
            <li
              key={url}
              className={cn(
                "group relative aspect-4/3 overflow-hidden rounded-xl border bg-secondary",
                index === 0 && "ring-2 ring-primary"
              )}
            >
              {/* Remote Cloudinary URLs, so a plain img avoids next/image config. */}
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
                    onClick={() => makeCover(url)}
                    aria-label="Use as cover photo"
                    className="flex size-8 items-center justify-center rounded-lg bg-card/95 text-foreground shadow-sm hover:bg-card"
                  >
                    <Star className="size-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(url)}
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
    </EditorDialog>
  );
}
