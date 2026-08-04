"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { BedDouble, Heart, MapPin, Star } from "lucide-react";
import type { PG } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AmenityChips } from "@/components/pg/Amenities";
import { VerifiedBadge } from "@/components/pg/VerifiedBadge";

const GENDER_STYLES: Record<PG["gender"], string> = {
  Boys: "bg-sky-100 text-sky-800",
  Girls: "bg-rose-100 text-rose-800",
  "Co-Living": "bg-violet-100 text-violet-800",
};

export function PGCard({ pg, className }: { pg: PG; className?: string }) {
  const [favourite, setFavourite] = useState(false);
  const href = `/pg/${pg.slug}`;

  function toggleFavourite() {
    setFavourite((prev) => {
      const next = !prev;
      toast(
        next
          ? `${pg.name} saved to favourites`
          : `${pg.name} removed from favourites`,
        { icon: next ? "❤️" : "💔", duration: 2000 }
      );
      return next;
    });
  }

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl border bg-card shadow-[0_1px_2px_rgb(38_22_10/0.04)] transition-shadow hover:shadow-[0_16px_40px_rgb(38_22_10/0.1)]",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={href} aria-label={`View details of ${pg.name}`}>
          <Image
            src={pg.images[0]}
            alt={`${pg.name} — ${pg.location}, ${pg.city}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </Link>

        {pg.verified && <VerifiedBadge className="absolute top-3 left-3" />}

        <motion.button
          type="button"
          whileTap={{ scale: 0.78 }}
          onClick={toggleFavourite}
          aria-label={
            favourite
              ? `Remove ${pg.name} from favourites`
              : `Save ${pg.name} to favourites`
          }
          aria-pressed={favourite}
          className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white"
        >
          <Heart
            className={cn(
              "size-4.5 transition-colors",
              favourite ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
            )}
          />
        </motion.button>

        <span
          className={cn(
            "absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            GENDER_STYLES[pg.gender]
          )}
        >
          {pg.gender}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className="min-w-0">
            <h3 className="truncate font-display text-lg font-bold text-foreground transition-colors group-hover:text-brand-ink">
              {pg.name}
            </h3>
          </Link>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs font-semibold text-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {pg.rating}
          </span>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0 text-brand-ink" />
            <span className="truncate">
              {pg.location}, {pg.city}
            </span>
          </p>
          <p className="pl-5 text-xs">{pg.distance}</p>
        </div>

        <AmenityChips amenities={pg.amenities} />

        <p className="flex items-center gap-1.5 text-xs font-medium text-success">
          <BedDouble className="size-3.5" />
          {pg.availableBeds} beds available
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
          <div>
            <p className="font-display text-xl font-extrabold text-foreground">
              {formatINR(pg.price)}
              <span className="text-xs font-medium text-muted-foreground">
                /month
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground">onwards</p>
          </div>
          <Button
            render={<Link href={href} />}
            className="h-10 rounded-full px-5 font-semibold"
          >
            View Details
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export function PGCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border bg-card">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded-lg bg-muted" />
        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="flex items-center justify-between border-t pt-4">
          <div className="h-6 w-24 animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-28 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
