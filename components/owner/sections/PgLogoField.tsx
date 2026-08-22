"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Building2, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadPgLogo } from "@/lib/api/pg";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface PgLogoFieldProps {
  /** Empty string means no logo set. */
  value: string;
  onChange: (url: string) => void;
}

export function PgLogoField({ value, onChange }: PgLogoFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please choose a JPEG, PNG or WebP image.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Please choose an image smaller than 5 MB.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setIsUploading(true);

    try {
      onChange(await uploadPgLogo(file));
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not upload the logo."
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <input
        ref={inputRef}
        id="pg-logo"
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFile}
        className="sr-only"
      />

      <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-background">
        {value ? (
          // Remote Cloudinary URL, so a plain img avoids next/image host config.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="PG logo" className="size-full object-contain" />
        ) : (
          <Building2 className="size-7 text-muted-foreground" />
        )}
      </span>

      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="h-11 rounded-full font-semibold"
        >
          {isUploading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
          {isUploading ? "Uploading..." : value ? "Change logo" : "Upload logo"}
        </Button>

        {value && !isUploading && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => onChange("")}
            className="h-11 rounded-full px-4 font-semibold text-muted-foreground"
          >
            <Trash2 className="size-4" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
