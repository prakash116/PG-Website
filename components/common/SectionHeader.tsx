import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedSection } from "@/components/common/AnimatedSection";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  align = "left",
  tone = "dark",
  className,
}: SectionHeaderProps) {
  const light = tone === "light";
  return (
    <AnimatedSection
      className={cn(
        "mb-10 flex flex-col gap-4 sm:mb-14",
        align === "center"
          ? "items-center text-center"
          : "sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p
            className={cn(
              "mb-3 text-xs font-semibold tracking-[0.18em] uppercase",
              light ? "text-white/60" : "text-brand-ink"
            )}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]",
            light ? "text-white" : "text-foreground"
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              "mt-3 text-base text-pretty sm:text-lg",
              light ? "text-white/70" : "text-muted-foreground"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold transition-colors",
            light
              ? "text-white/80 hover:text-white"
              : "text-brand-ink hover:text-brand-ink/80"
          )}
        >
          {action.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </AnimatedSection>
  );
}
