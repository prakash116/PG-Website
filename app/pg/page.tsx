import type { Metadata } from "next";
import { Suspense } from "react";
import { PGListing } from "@/components/pg/PGListing";
import { PGCardSkeleton } from "@/components/pg/PGCard";

export const metadata: Metadata = {
  title: "Find PGs & Rooms",
  description:
    "Browse verified PGs and rooms across Delhi, Gurugram, Noida, Bengaluru, Pune and Mumbai. Filter by budget, room type, amenities and more.",
};

function ListingFallback() {
  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div className="hidden h-150 rounded-3xl border bg-card lg:block" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PGCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function PGListingPage() {
  return (
    <div className="bg-secondary/40">
      <div className="container-page pt-28 pb-20 sm:pt-32">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Find your next home
          </h1>
          <p className="mt-2 text-muted-foreground">
            Verified PGs and rooms across India&apos;s top cities — filtered your
            way.
          </p>
        </div>
        <Suspense fallback={<ListingFallback />}>
          <PGListing />
        </Suspense>
      </div>
    </div>
  );
}
