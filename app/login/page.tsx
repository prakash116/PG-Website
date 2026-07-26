import type { Metadata } from "next";
import Image from "next/image";
import { Star } from "lucide-react";
import { PzzeeMark } from "@/components/common/Logo";
import { LoginForm } from "@/components/forms/LoginForm";
import { AnimatedSection } from "@/components/common/AnimatedSection";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Log in to Pzzee with your phone number or email to save favourites, book visits and manage your PG search.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-secondary/40 px-4 pt-24 pb-16 sm:pt-28">
      <AnimatedSection className="w-full max-w-4xl">
        <div className="grid overflow-hidden rounded-[2rem] border bg-card shadow-[0_24px_64px_rgb(2_6_23/0.1)] lg:grid-cols-2">
          {/* Brand panel */}
          <div className="relative hidden lg:block">
            <Image
              src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1400&auto=format&fit=crop"
              alt="Cozy PG room interior"
              fill
              sizes="(max-width: 1024px) 0px, 480px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/20" />
            <div className="relative flex h-full flex-col justify-between p-10">
              <PzzeeMark className="size-11" />
              <div>
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <blockquote className="font-display text-xl leading-snug font-bold text-white">
                  “Found my PG in two days — the photos matched exactly what I
                  saw during the visit.”
                </blockquote>
                <p className="mt-3 text-sm text-white/70">
                  Ananya Sharma · Student, Delhi University
                </p>
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="p-6 sm:p-10">
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome to Pzzee
            </h1>
            <p className="mt-2 mb-8 text-sm text-muted-foreground sm:text-[15px]">
              Log in to save favourites, book visits and pick up your search
              where you left off.
            </p>
            <LoginForm />
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
