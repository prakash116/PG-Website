import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BedDouble, Check } from "lucide-react";
import { roomCategories } from "@/data/rooms";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StaggerGroup, StaggerItem } from "@/components/common/AnimatedSection";

/**
 * Asymmetric 12-column layout: wide horizontal cards alternate with
 * tall portrait cards so the section doesn't read as a plain grid.
 */
const LAYOUTS = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-7",
];

export function RoomTypes() {
  return (
    <section id="rooms" className="scroll-mt-24 bg-secondary/60 py-20 sm:py-24">
      <div className="container-page">
        <SectionHeader
          eyebrow="Rooms for every lifestyle"
          title="Choose Your Room"
          subtitle="From private singles to budget-friendly sharing — pick the space that fits how you live."
        />

        <StaggerGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
          {roomCategories.map((room, i) => {
            const wide = LAYOUTS[i] === "lg:col-span-7";
            return (
              <StaggerItem
                key={room.id}
                className={cn("sm:col-span-1", LAYOUTS[i])}
              >
                <article
                  className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-3xl border bg-card shadow-[0_1px_2px_rgb(38_22_10/0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgb(38_22_10/0.1)]",
                    wide && "lg:flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "relative aspect-[16/10] overflow-hidden",
                      wide && "lg:aspect-auto lg:w-1/2"
                    )}
                  >
                    <Image
                      src={room.image}
                      alt={`${room.name} — ${room.tagline}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-foreground backdrop-blur">
                      {room.name}
                    </span>
                  </div>

                  <div className={cn("flex flex-1 flex-col p-6", wide && "lg:p-8")}>
                    <p className="text-sm font-medium text-brand-ink">
                      {room.tagline}
                    </p>
                    <p className="mt-2 font-display text-2xl font-extrabold text-foreground">
                      {formatINR(room.price)}
                      <span className="text-sm font-medium text-muted-foreground">
                        /month onwards
                      </span>
                    </p>

                    <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                      {room.amenities.map((amenity) => (
                        <li
                          key={amenity}
                          className="flex items-center gap-1.5 text-sm text-muted-foreground"
                        >
                          <Check className="size-3.5 shrink-0 text-success" />
                          {amenity}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-success">
                        <BedDouble className="size-4" />
                        {room.availableBeds} beds available
                      </p>
                      <Link
                        href={`/pg?occupancy=${room.occupancy === "Premium" ? "Single" : room.occupancy}`}
                        className="group/link inline-flex items-center gap-1 text-sm font-bold text-brand-ink transition-colors hover:text-brand-ink/80"
                      >
                        Explore
                        <ArrowUpRight className="size-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
