"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    eyebrow: "Trusted by 10,000+ students & professionals",
    headline: "Find a PG That Actually Feels Like Home.",
    subheading:
      "Discover verified, affordable and comfortable PGs near your college or workplace.",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2000&auto=format&fit=crop",
    alt: "Warm, sunlit shared living room of a modern PG",
    primary: { label: "Find Your PG", href: "/pg" },
    secondary: { label: "Explore Rooms", href: "/#rooms" },
  },
  {
    eyebrow: "Every listing checked by our team",
    headline: "Verified PGs. Zero Guesswork.",
    subheading:
      "Explore trusted properties with verified details, amenities, photos and transparent pricing.",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2000&auto=format&fit=crop",
    alt: "Bright verified PG bedroom with large windows",
    primary: { label: "Explore Verified PGs", href: "/pg?verified=1" },
    secondary: null,
  },
  {
    eyebrow: "Smart search built for real life",
    headline: "Your Budget. Your Location. Your Room.",
    subheading:
      "Tell us what you need and discover PGs that fit your lifestyle and budget.",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2000&auto=format&fit=crop",
    alt: "Cozy studio room interior with desk and bed",
    primary: { label: "Search PG", href: "/#smart-search" },
    secondary: null,
  },
];

const AUTOPLAY_MS = 6000;
const MANUAL_PAUSE_MS = 12000;

const textGroup = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

const textItem = {
  hidden: { opacity: 0, y: 34 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      AUTOPLAY_MS
    );
    return () => clearInterval(timer);
  }, [paused]);

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    []
  );

  // Manual interaction pauses autoplay briefly so the user stays in control.
  const goTo = useCallback((next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), MANUAL_PAUSE_MS);
  }, []);

  const slide = SLIDES[index];

  return (
    <section
      id="home"
      aria-label="Featured highlights"
      className="relative h-[92svh] max-h-[860px] min-h-[600px] overflow-hidden bg-slate-950"
    >
      {/* Slide backgrounds — all mounted for smooth crossfades */}
      {SLIDES.map((s, i) => (
        <motion.div
          key={s.headline}
          initial={false}
          animate={{ opacity: i === index ? 1 : 0, scale: i === index ? 1 : 1.06 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute inset-0"
          aria-hidden={i !== index}
        >
          <Image
            src={s.image}
            alt={s.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-slate-950/20" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-slate-950/80 to-transparent" />
        </motion.div>
      ))}

      {/* Copy */}
      <div className="container-page relative z-10 flex h-full items-center pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            variants={textGroup}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-w-2xl"
          >
            <motion.p
              variants={textItem}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur sm:text-sm"
            >
              <Sparkles className="size-3.5 text-amber-300" />
              {slide.eyebrow}
            </motion.p>
            <motion.h1
              variants={textItem}
              className="font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance text-white sm:text-6xl lg:text-7xl"
            >
              {slide.headline}
            </motion.h1>
            <motion.p
              variants={textItem}
              className="mt-5 max-w-xl text-base text-pretty text-white/75 sm:text-lg"
            >
              {slide.subheading}
            </motion.p>
            <motion.div
              variants={textItem}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button
                render={<Link href={slide.primary.href} />}
                className="h-13 rounded-full bg-primary px-7 text-base font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90"
              >
                {slide.primary.label}
                <ArrowRight className="size-4.5" data-icon="inline-end" />
              </Button>
              {slide.secondary && (
                <Button
                  render={<Link href={slide.secondary.href} />}
                  className="h-13 rounded-full border border-white/25 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur hover:bg-white/20"
                >
                  {slide.secondary.label}
                </Button>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="container-page pointer-events-none absolute inset-x-0 bottom-28 z-10 flex items-center justify-between sm:bottom-24">
        <div
          className="pointer-events-auto flex items-center gap-2"
          role="tablist"
          aria-label="Slides"
        >
          {SLIDES.map((s, i) => (
            <button
              key={s.headline}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index
                  ? "w-8 bg-white"
                  : "w-3 bg-white/40 hover:bg-white/70"
              )}
            />
          ))}
        </div>
        <div className="pointer-events-auto hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous slide"
            className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next slide"
            className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
