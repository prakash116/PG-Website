import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BedDouble,
  ChevronLeft,
  CircleCheck,
  MapPin,
  Navigation,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { getPGBySlug, getSimilarPGs, pgs } from "@/data/pg";
import { sampleReviews } from "@/data/testimonials";
import { formatINR } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AmenitiesGrid } from "@/components/pg/Amenities";
import { ContactCard } from "@/components/pg/ContactCard";
import { PGGallery } from "@/components/pg/PGGallery";
import { PGGrid } from "@/components/pg/PGGrid";
import { RoomCard } from "@/components/pg/RoomCard";
import { VerifiedBadge } from "@/components/pg/VerifiedBadge";

interface PGDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return pgs.map((pg) => ({ slug: pg.slug }));
}

export async function generateMetadata({
  params,
}: PGDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pg = getPGBySlug(slug);
  if (!pg) return { title: "PG not found" };
  return {
    title: `${pg.name} — ${pg.location}, ${pg.city}`,
    description: `${pg.name} in ${pg.location}, ${pg.city}. ${pg.gender} PG from ${formatINR(pg.price)}/month. ${pg.amenities.slice(0, 4).join(", ")} and more.`,
  };
}

export default async function PGDetailPage({ params }: PGDetailPageProps) {
  const { slug } = await params;
  const pg = getPGBySlug(slug);
  if (!pg) notFound();

  const similar = getSimilarPGs(pg);

  return (
    <div className="container-page pt-24 pb-20 sm:pt-28">
      {/* Breadcrumb-ish back link */}
      <Link
        href="/pg"
        className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to all PGs
      </Link>

      <PGGallery images={pg.images} name={pg.name} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
        {/* Main column */}
        <div className="min-w-0">
          {/* Title */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {pg.name}
            </h1>
            {pg.verified && <VerifiedBadge size="md" />}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <strong className="font-semibold text-foreground">
                {pg.rating}
              </strong>
              ({pg.reviewCount} reviews)
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" />
              {pg.location}, {pg.city}
            </span>
            <span aria-hidden="true">·</span>
            <span>{pg.distance}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-foreground">
              {pg.gender}
            </span>
            {pg.foodIncluded && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3.5 py-1.5 text-xs font-semibold text-success">
                <UtensilsCrossed className="size-3.5" />
                Food Included
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-secondary-foreground">
              <BedDouble className="size-3.5" />
              {pg.availableBeds} beds available
            </span>
          </div>

          <Separator className="my-8" />

          {/* About */}
          <section aria-labelledby="about-heading">
            <h2
              id="about-heading"
              className="font-display text-xl font-bold sm:text-2xl"
            >
              About this PG
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {pg.description}
            </p>
          </section>

          <Separator className="my-8" />

          {/* Amenities */}
          <section aria-labelledby="amenities-heading">
            <h2
              id="amenities-heading"
              className="font-display text-xl font-bold sm:text-2xl"
            >
              Amenities
            </h2>
            <AmenitiesGrid amenities={pg.amenities} className="mt-5" />
          </section>

          <Separator className="my-8" />

          {/* Food */}
          <section aria-labelledby="food-heading">
            <h2
              id="food-heading"
              className="font-display text-xl font-bold sm:text-2xl"
            >
              Food details
            </h2>
            <div className="mt-4 flex gap-4 rounded-2xl border bg-secondary/50 p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                <UtensilsCrossed className="size-5" />
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {pg.foodDetails}
              </p>
            </div>
          </section>

          <Separator className="my-8" />

          {/* Room options */}
          <section aria-labelledby="rooms-heading">
            <h2
              id="rooms-heading"
              className="font-display text-xl font-bold sm:text-2xl"
            >
              Room options
            </h2>
            <div className="mt-5 space-y-4">
              {pg.roomTypes.map((room, i) => (
                <RoomCard
                  key={room.type}
                  room={room}
                  image={pg.images[(i + 1) % pg.images.length]}
                  pgName={pg.name}
                />
              ))}
            </div>
          </section>

          <Separator className="my-8" />

          {/* House rules */}
          <section aria-labelledby="rules-heading">
            <h2
              id="rules-heading"
              className="font-display text-xl font-bold sm:text-2xl"
            >
              House rules
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {pg.houseRules.map((rule) => (
                <li
                  key={rule}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  {rule}
                </li>
              ))}
            </ul>
          </section>

          <Separator className="my-8" />

          {/* Location */}
          <section aria-labelledby="location-heading">
            <h2
              id="location-heading"
              className="font-display text-xl font-bold sm:text-2xl"
            >
              Location & nearby
            </h2>

            {/* Map placeholder */}
            <div className="relative mt-5 flex h-64 items-center justify-center overflow-hidden rounded-3xl border bg-secondary">
              <div
                aria-hidden="true"
                className="bg-dot-pattern absolute inset-0 text-primary opacity-30"
              />
              <div className="relative flex flex-col items-center gap-2 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30">
                  <MapPin className="size-6" />
                </span>
                <p className="text-sm font-semibold text-foreground">
                  {pg.location}, {pg.city}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pg.coordinates.lat.toFixed(4)}°N,{" "}
                  {pg.coordinates.lng.toFixed(4)}°E · Interactive map coming
                  soon
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {pg.nearby.map((place) => (
                <span
                  key={place}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-2 text-xs font-medium text-foreground"
                >
                  <Navigation className="size-3.5 text-primary" />
                  {place}
                </span>
              ))}
            </div>
          </section>

          <Separator className="my-8" />

          {/* Reviews */}
          <section aria-labelledby="reviews-heading">
            <div className="flex items-center justify-between">
              <h2
                id="reviews-heading"
                className="font-display text-xl font-bold sm:text-2xl"
              >
                Resident reviews
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700">
                <Star className="size-4 fill-amber-500 text-amber-500" />
                {pg.rating} · {pg.reviewCount} reviews
              </span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {sampleReviews.map((review) => (
                <article
                  key={review.id}
                  className="flex flex-col rounded-2xl border bg-card p-5"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={review.avatar}
                      alt={`Photo of ${review.name}`}
                      width={40}
                      height={40}
                      className="size-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {review.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {review.date}
                      </p>
                    </div>
                  </div>
                  <div
                    className="mt-3 flex gap-0.5"
                    role="img"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < review.rating
                            ? "size-3.5 fill-amber-400 text-amber-400"
                            : "size-3.5 fill-muted text-muted"
                        }
                      />
                    ))}
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* Sticky contact card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ContactCard pg={pg} />
        </aside>
      </div>

      {/* Similar PGs */}
      {similar.length > 0 && (
        <div className="mt-20">
          <SectionHeader
            eyebrow="Keep exploring"
            title="Similar PGs you may like"
            action={{ label: "View all PGs", href: "/pg" }}
            className="mb-8"
          />
          <PGGrid pgs={similar} />
        </div>
      )}

      {/* Mobile sticky action bar */}
      <AnimatedSection className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 backdrop-blur-lg lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="pl-1">
            <p className="font-display text-lg leading-tight font-extrabold">
              {formatINR(pg.price)}
              <span className="text-xs font-medium text-muted-foreground">
                /mo
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground">onwards</p>
          </div>
          <a
            href={`tel:${pg.owner.phone}`}
            className="flex h-11 flex-1 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
          >
            Contact Property
          </a>
        </div>
      </AnimatedSection>
    </div>
  );
}
