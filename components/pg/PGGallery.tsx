"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface PGGalleryProps {
  images: string[];
  name: string;
}

export function PGGallery({ images, name }: PGGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  const step = (delta: number) =>
    setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <>
      {/* Mobile: single hero image */}
      <button
        type="button"
        onClick={() => openAt(0)}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-3xl md:hidden"
        aria-label={`Open photo gallery of ${name}`}
      >
        <Image
          src={images[0]}
          alt={`${name} — main photo`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          <Camera className="size-3.5" />
          {images.length} photos
        </span>
      </button>

      {/* Desktop: collage */}
      <div className="hidden aspect-[2/1] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl md:grid">
        {images.slice(0, 4).map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => openAt(i)}
            aria-label={`Open photo ${i + 1} of ${name}`}
            className={cn(
              "group relative overflow-hidden",
              i === 0 && "col-span-2 row-span-2",
              i === 3 && "col-span-2"
            )}
          >
            <Image
              src={src}
              alt={`${name} — photo ${i + 1}`}
              fill
              priority={i === 0}
              sizes={i === 0 ? "50vw" : "25vw"}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {i === 3 && (
              <span className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur">
                <Camera className="size-4" />
                View all {images.length} photos
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[min(96vw,64rem)] max-w-none border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">
            Photos of {name}
          </DialogTitle>
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-black">
            <Image
              src={images[index]}
              alt={`${name} — photo ${index + 1} of ${images.length}`}
              fill
              sizes="96vw"
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30"
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
              {index + 1} / {images.length}
            </span>
          </div>
          <div className="mt-3 flex justify-center gap-2">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={cn(
                  "relative size-16 overflow-hidden rounded-lg border-2 transition-all",
                  i === index
                    ? "border-white opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
