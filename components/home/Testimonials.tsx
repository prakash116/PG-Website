import Image from "next/image";
import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { testimonials } from "@/data/testimonials";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AnimatedSection } from "@/components/common/AnimatedSection";

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure
      className={cn(
        "flex h-full shrink-0 flex-col rounded-3xl border bg-card p-7",
        t.featured
          ? "w-[88vw] border-primary/20 shadow-[0_16px_40px_rgb(38_22_10/0.08)] sm:w-105"
          : "w-[82vw] sm:w-89"
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex gap-0.5"
          role="img"
          aria-label={`${t.rating} out of 5 stars`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "size-4",
                i < t.rating
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted text-muted"
              )}
            />
          ))}
        </div>
        <Quote className="size-6 text-brand-ink/20" />
      </div>

      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground/85">
        “{t.review}”
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3 border-t pt-5">
        <Image
          src={t.avatar}
          alt={`Photo of ${t.name}`}
          width={44}
          height={44}
          className="size-11 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-bold text-foreground">{t.name}</p>
          <p className="text-xs text-muted-foreground">
            {t.role} · {t.city}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  // Duplicate the list so the marquee loops seamlessly.
  const loop = [...testimonials, ...testimonials];

  return (
    <section
      id="testimonials"
      className="scroll-mt-24 overflow-hidden bg-secondary/60 py-20 sm:py-24"
    >
      <div className="container-page">
        <SectionHeader
          eyebrow="Real stays, real stories"
          title="Loved by Students & Professionals"
          subtitle="Thousands have found their next home through Pzee — here's what a few of them say."
          align="center"
        />
      </div>

      <AnimatedSection>
        <div
          className="group relative"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          }}
        >
          <div className="flex w-max animate-marquee gap-5 pr-5 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {loop.map((t, i) => (
              <TestimonialCard key={`${t.id}-${i}`} t={t} />
            ))}
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
