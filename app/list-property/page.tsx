import type { Metadata } from "next";
import { BadgeCheck, IndianRupee, TrendingUp, Users } from "lucide-react";
import { ListPropertyForm } from "@/components/forms/ListPropertyForm";
import { AnimatedSection } from "@/components/common/AnimatedSection";

export const metadata: Metadata = {
  title: "List Your PG",
  description:
    "List your PG or co-living property on Pzzee for free and connect with thousands of verified students and working professionals.",
};

const BENEFITS = [
  {
    icon: Users,
    title: "Reach thousands of seekers",
    description:
      "Students and professionals search Pzzee every day for their next home.",
  },
  {
    icon: BadgeCheck,
    title: "Get the Verified badge",
    description:
      "Verified properties get up to 3x more enquiries and better-quality leads.",
  },
  {
    icon: IndianRupee,
    title: "Zero listing fees",
    description:
      "Listing your property is completely free — no commissions on bookings.",
  },
  {
    icon: TrendingUp,
    title: "Fill beds faster",
    description:
      "Owners on Pzzee fill vacant beds in days, not months.",
  },
];

export default function ListPropertyPage() {
  return (
    <div className="bg-secondary/40">
      <div className="container-page grid gap-12 pt-28 pb-20 sm:pt-32 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        {/* Left: pitch */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <AnimatedSection>
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-brand-ink uppercase">
              For property owners
            </p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl lg:leading-[1.08]">
              List your PG. Fill your beds.
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
              Join hundreds of owners who trust Pzzee to connect them with
              serious, verified residents.
            </p>
          </AnimatedSection>

          <div className="mt-10 space-y-5">
            {BENEFITS.map((benefit, i) => (
              <AnimatedSection key={benefit.title} delay={i * 0.08} y={18}>
                <div className="flex gap-4 rounded-2xl border bg-card p-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <benefit.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-[15px] font-bold">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <AnimatedSection delay={0.15}>
          <ListPropertyForm />
        </AnimatedSection>
      </div>
    </div>
  );
}
