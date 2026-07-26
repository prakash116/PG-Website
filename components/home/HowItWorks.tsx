"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { HeartHandshake, Scale, Search } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StaggerGroup, StaggerItem } from "@/components/common/AnimatedSection";

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    icon: Search,
    title: "Search",
    description: "Choose your location, budget and room preference.",
  },
  {
    number: "02",
    icon: Scale,
    title: "Compare",
    description: "Compare verified PGs, rooms, amenities and pricing.",
  },
  {
    number: "03",
    icon: HeartHandshake,
    title: "Connect",
    description:
      "Shortlist your favourite PG and connect with the property.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container-page scroll-mt-24 py-20 sm:py-24">
      <SectionHeader
        eyebrow="Simple by design"
        title="Find Your PG in 3 Simple Steps"
        align="center"
      />

      <div className="relative mx-auto max-w-5xl">
        {/* Connecting line — horizontal on desktop */}
        <div className="absolute top-10 right-[16%] left-[16%] hidden h-px md:block">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
            className="h-full w-full origin-left border-t-2 border-dashed border-primary/30"
          />
        </div>
        {/* Connecting line — vertical on mobile */}
        <div className="absolute top-16 bottom-16 left-10 w-px md:hidden">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeInOut" }}
            className="h-full w-full origin-top border-l-2 border-dashed border-primary/30"
          />
        </div>

        <StaggerGroup className="relative grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step) => (
            <StaggerItem key={step.number}>
              <div className="flex items-start gap-5 md:flex-col md:items-center md:text-center">
                <div className="relative shrink-0">
                  <span className="flex size-20 items-center justify-center rounded-3xl border bg-card shadow-[0_8px_24px_rgb(2_6_23/0.06)]">
                    <step.icon className="size-8 text-primary" />
                  </span>
                  <span className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-primary font-display text-[11px] font-extrabold text-primary-foreground">
                    {step.number}
                  </span>
                </div>
                <div className="pt-1 md:pt-4">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-60 text-sm leading-relaxed text-muted-foreground md:mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
