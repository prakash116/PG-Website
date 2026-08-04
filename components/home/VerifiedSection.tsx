import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/common/AnimatedSection";

const CHECKLIST = [
  "Property details checked",
  "Location verified",
  "Amenities confirmed",
  "Photos reviewed",
  "Owner information verified",
];

export function VerifiedSection() {
  return (
    <section id="verified" className="scroll-mt-24 bg-secondary/60 py-20 sm:py-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Image collage */}
        <AnimatedSection className="relative">
          <div className="grid grid-cols-5 grid-rows-6 gap-3" style={{ aspectRatio: "10/11" }}>
            <div className="relative col-span-3 row-span-4 overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop"
                alt="Verified PG bedroom with fresh linen"
                fill
                sizes="(max-width: 1024px) 60vw, 30vw"
                className="object-cover"
              />
            </div>
            <div className="relative col-span-2 row-span-3 overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop"
                alt="Study corner inside a verified PG"
                fill
                sizes="(max-width: 1024px) 40vw, 20vw"
                className="object-cover"
              />
            </div>
            <div className="relative col-span-2 row-span-3 overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop"
                alt="Shared kitchen of a verified property"
                fill
                sizes="(max-width: 1024px) 40vw, 20vw"
                className="object-cover"
              />
            </div>
            <div className="relative col-span-3 row-span-2 overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop"
                alt="Bright common lounge of a verified PG"
                fill
                sizes="(max-width: 1024px) 60vw, 30vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Floating seal */}
          <div className="absolute -right-3 -bottom-5 flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-[0_20px_48px_rgb(38_22_10/0.16)] sm:right-6">
            <span className="flex size-12 items-center justify-center rounded-full bg-success/10 ring-4 ring-success/20">
              <BadgeCheck className="size-6 text-success" />
            </span>
            <div>
              <p className="font-display text-sm font-extrabold text-foreground">
                Pzzee Verified
              </p>
              <p className="text-xs text-muted-foreground">
                5-point property check
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Copy */}
        <div>
          <AnimatedSection>
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-brand-ink uppercase">
              Trust, built in
            </p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              Stay Verified. Stay Worry-Free.
            </h2>
            <p className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
              Before a property earns the Pzzee Verified badge, our team checks
              it in person and on paper — so what you see online is exactly
              what you get at the door.
            </p>
          </AnimatedSection>

          <ul className="mt-8 space-y-3.5">
            {CHECKLIST.map((item, i) => (
              <AnimatedSection key={item} delay={i * 0.07} y={16}>
                <li className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3.5">
                  <CircleCheck className="size-5 shrink-0 fill-success text-white" />
                  <span className="text-sm font-medium text-foreground sm:text-[15px]">
                    {item}
                  </span>
                </li>
              </AnimatedSection>
            ))}
          </ul>

          <AnimatedSection delay={0.3} className="mt-8">
            <Button
              render={<Link href="/pg?verified=1" />}
              className="h-12 rounded-full px-7 text-[15px] font-semibold"
            >
              View Verified PGs
              <ArrowRight className="size-4.5" data-icon="inline-end" />
            </Button>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
