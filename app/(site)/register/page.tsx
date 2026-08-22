import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, MessagesSquare, ShieldCheck, Wallet } from "lucide-react";
import { PzeeMark } from "@/components/common/Logo";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { RegisterForm } from "@/components/forms/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your Pzee account to find verified PGs or list and manage your property.",
};

const BENEFITS = [
  {
    icon: BadgeCheck,
    title: "Verified listings only",
    description: "Location, photos, pricing and owner identity are checked.",
  },
  {
    icon: Wallet,
    title: "Transparent pricing",
    description: "Rent, deposit and charges upfront — no surprises later.",
  },
  {
    icon: MessagesSquare,
    title: "Direct connection",
    description: "Talk to owners and managers — no brokers, no middlemen.",
  },
];

export default function RegisterPage() {
  return (
    <div className="relative overflow-hidden bg-secondary/40 pt-24 pb-16 sm:pt-28 sm:pb-20">
      {/* Ambient brand wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-24 size-96 animate-float rounded-full bg-saffron-200/45 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 size-104 animate-float-slow rounded-full bg-saffron-100/60 blur-[140px]"
      />

      <div className="container-page relative">
        <div className="grid items-start gap-6 lg:grid-cols-[20.5rem_minmax(0,1fr)] lg:gap-8 xl:gap-10">
          {/* Brand panel — top-aligned with the form card */}
          <AnimatedSection>
            <aside className="relative overflow-hidden rounded-[2rem] bg-brand-deep p-8 text-white shadow-[0_24px_64px_rgb(38_22_10/0.18)]">
              <div
                aria-hidden="true"
                className="bg-dot-pattern absolute inset-0 text-white/40 opacity-15"
              />
              <div
                aria-hidden="true"
                className="absolute -top-20 -right-16 size-56 animate-float rounded-full bg-primary/40 blur-[90px]"
              />

              <div className="relative">
                <PzeeMark className="size-12" />

                <p className="mt-7 text-xs font-bold tracking-[0.18em] text-primary uppercase">
                  Join Pzee
                </p>
                <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-balance sm:text-[2.1rem] sm:leading-[1.15]">
                  One account. Every verified PG.
                </h1>
                <p className="mt-3.5 text-sm leading-relaxed text-white/65">
                  Register as a resident to find the right place, or as a PG
                  owner to list and manage your property.
                </p>

                <ul className="mt-8 hidden space-y-5 border-t border-white/12 pt-8 lg:block">
                  {BENEFITS.map((benefit) => (
                    <li key={benefit.title} className="flex gap-3.5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary">
                        <benefit.icon className="size-4.5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {benefit.title}
                        </p>
                        <p className="mt-0.5 text-[13px] leading-relaxed text-white/55">
                          {benefit.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="mt-8 hidden items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-[13px] text-white/60 lg:flex">
                  <ShieldCheck className="size-4 shrink-0 text-primary" />
                  Your details stay private and are never sold.
                </p>
              </div>
            </aside>
          </AnimatedSection>

          {/* Form card */}
          <AnimatedSection delay={0.1}>
            <div className="rounded-[2rem] border bg-card p-5 shadow-[0_24px_64px_rgb(38_22_10/0.1)] sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-6">
                <div>
                  <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Create your account
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Takes about a minute. Fields marked{" "}
                    <span className="font-semibold text-brand-ink">*</span> are
                    required.
                  </p>
                </div>
                <p className="hidden text-sm text-muted-foreground sm:block">
                  Already registered?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-brand-ink hover:underline"
                  >
                    Login
                  </Link>
                </p>
              </div>

              <div className="pt-7">
                <RegisterForm />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
