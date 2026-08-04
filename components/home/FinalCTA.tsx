import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/common/AnimatedSection";

export function FinalCTA() {
  return (
    <section aria-label="Get started" className="container-page pt-4 pb-20 sm:pb-24">
      <AnimatedSection>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-deep px-6 py-16 text-center sm:px-12 sm:py-20">
          {/* Ambient background elements */}
          <div
            aria-hidden="true"
            className="absolute -top-24 -left-16 size-72 animate-float rounded-full bg-primary/50 blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="absolute -right-16 -bottom-28 size-80 animate-float-slow rounded-full bg-saffron-300/35 blur-[120px]"
          />
          <div
            aria-hidden="true"
            className="bg-dot-pattern absolute inset-0 text-white/40 opacity-15"
          />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance text-white sm:text-5xl sm:leading-[1.1]">
              Your Next Room Could Be One Search Away.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-pretty text-white/70 sm:text-lg">
              Discover verified PGs around you and move into a place that fits
              your life.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
              <Button
                render={<Link href="/pg" />}
                className="h-13 rounded-full bg-white px-8 text-base font-bold text-brand-deep shadow-xl shadow-black/25 hover:bg-white/90"
              >
                Find My PG
                <ArrowRight className="size-4.5" data-icon="inline-end" />
              </Button>
              <Button
                render={<Link href="/list-property" />}
                className="h-13 rounded-full border border-white/25 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                <Building2 className="size-4.5" data-icon="inline-start" />
                List Your Property
              </Button>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
