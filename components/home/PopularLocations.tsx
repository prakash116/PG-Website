import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import { locations } from "@/data/locations";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StaggerGroup, StaggerItem } from "@/components/common/AnimatedSection";

/** Bento layout — the first two cities get large tiles. */
const TILE_CLASSES = [
  "sm:col-span-2 sm:row-span-2",
  "sm:col-span-2",
  "",
  "",
  "sm:col-span-2",
  "sm:col-span-2",
];

export function PopularLocations() {
  return (
    <section id="locations" className="container-page scroll-mt-24 py-20 sm:py-24">
      <SectionHeader
        eyebrow="Where do you want to live?"
        title="Popular PG Locations"
        subtitle="Explore the neighbourhoods where students and professionals love to stay."
        action={{ label: "Browse all cities", href: "/pg" }}
      />

      <StaggerGroup className="grid auto-rows-[180px] grid-cols-1 gap-4 sm:grid-cols-4 sm:auto-rows-[200px]">
        {locations.map((city, i) => (
          <StaggerItem key={city.id} className={cn("min-h-44", TILE_CLASSES[i])}>
            <Link
              href={`/pg?location=${encodeURIComponent(city.name)}`}
              aria-label={`Explore PGs in ${city.name}`}
              className="group relative block h-full overflow-hidden rounded-3xl"
            >
              <Image
                src={city.image}
                alt={`PGs in ${city.name}`}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent transition-opacity duration-300 group-hover:from-ink/90" />

              <span className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100">
                <ArrowUpRight className="size-4" />
              </span>

              <div className="absolute right-5 bottom-4 left-5">
                <h3 className="font-display text-xl font-extrabold text-white sm:text-2xl">
                  {city.name}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-white/80 sm:text-[13px]">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="size-3.5" />
                    {city.pgCount}
                  </span>
                  <span aria-hidden="true" className="opacity-50">
                    •
                  </span>
                  <span>Starting {formatINR(city.startingPrice)}/month</span>
                </div>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
