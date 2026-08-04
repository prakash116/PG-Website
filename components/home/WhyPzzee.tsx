import type { LucideIcon } from "lucide-react";
import { BadgeCheck, MessagesSquare, Search, Wallet } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StaggerGroup, StaggerItem } from "@/components/common/AnimatedSection";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: BadgeCheck,
    title: "Verified Properties",
    description:
      "Every listed PG undergoes verification — location, photos, pricing and owner identity.",
  },
  {
    icon: Wallet,
    title: "Transparent Pricing",
    description:
      "Know the rent, deposit and major charges before you visit. No surprises later.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Discover PGs according to budget, location and preferences in seconds.",
  },
  {
    icon: MessagesSquare,
    title: "Direct Connection",
    description:
      "Connect with PG owners or managers quickly — no brokers, no middlemen.",
  },
];

export function WhyPzzee() {
  return (
    <section id="why-pzzee" className="container-page scroll-mt-24 py-20 sm:py-24">
      <SectionHeader
        eyebrow="Why Pzzee"
        title="PG Hunting, Made Simple."
        subtitle="We rebuilt the PG search from scratch so you never have to rely on hearsay, brokers or blurry WhatsApp photos again."
        align="center"
      />

      <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <StaggerItem key={feature.title} className="h-full">
            <div className="group flex h-full flex-col rounded-3xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_16px_40px_rgb(38_22_10/0.08)]">
              <span className="flex size-13 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
