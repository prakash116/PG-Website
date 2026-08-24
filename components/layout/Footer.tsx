"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { LoaderCircle, Send } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import { subscribe } from "@/lib/api/subscribers";

const LINK_COLUMNS = [
  {
    heading: "Explore",
    links: [
      { label: "Find PG", href: "/pg" },
      { label: "Rooms", href: "/#rooms" },
      { label: "Verified PG", href: "/#verified" },
      { label: "Popular Locations", href: "/#locations" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/#why-pzee" },
      { label: "Contact", href: "/#faq" },
      { label: "Careers", href: "/#why-pzee" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Privacy Policy", href: "/#faq" },
      { label: "Terms & Conditions", href: "/#faq" },
      { label: "Help Center", href: "/#faq" },
    ],
  },
];

const SOCIALS = [
  { label: "Instagram", icon: FaInstagram, href: "https://instagram.com" },
  { label: "X (Twitter)", icon: FaXTwitter, href: "https://x.com" },
  { label: "LinkedIn", icon: FaLinkedinIn, href: "https://linkedin.com" },
  { label: "YouTube", icon: FaYoutube, href: "https://youtube.com" },
];

export function Footer() {
  const [isSubscribing, setIsSubscribing] = useState(false);

  async function handleSubscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubscribing(true);

    try {
      const response = await subscribe(email);
      toast.success(response.message);
      form.reset();
    } catch (error: unknown) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not subscribe right now. Please try again."
      );
    } finally {
      setIsSubscribing(false);
    }
  }

  return (
    <footer className="overflow-hidden bg-ink text-white/75">
      <div className="container-page pt-10 pb-6 sm:pt-12">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Logo tone="light" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              Helping you discover trusted PGs and rooms without the usual
              hassle.
            </p>
            <div className="mt-4 flex gap-2">
              {SOCIALS.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full bg-white/5 text-white/75 transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            {LINK_COLUMNS.map((col) => (
              <div key={col.heading}>
                <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
                  {col.heading}
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/60 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-9 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Get PG updates in your inbox
            </h3>
            <p className="mt-1 text-sm text-white/60">
              New verified PGs, price drops and moving tips. No spam, ever.
            </p>
          </div>
          <form
            onSubmit={handleSubscribe}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <Input
              id="footer-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isSubscribing}
              required
              className="h-11 flex-1 rounded-full border-white/15 bg-white/10 px-4 text-white placeholder:text-white/40"
            />
            <Button
              type="submit"
              disabled={isSubscribing}
              className="h-11 shrink-0 rounded-full bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {isSubscribing ? "Subscribing..." : "Subscribe"}
              {isSubscribing ? (
                <LoaderCircle
                  className="size-4 animate-spin"
                  data-icon="inline-end"
                />
              ) : (
                <Send className="size-4" data-icon="inline-end" />
              )}
            </Button>
          </form>
        </div>

        {/* Bottom bar */}
        <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-sm text-white/45 sm:flex-row">
          <p>© 2026 Pzee. All rights reserved.</p>
          <p>
            Made for students & professionals across India{" "}
            <span aria-hidden="true">🇮🇳</span>
          </p>
        </div>
      </div>

      {/* Oversized watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none -mb-[3vw] text-center font-display text-[20vw] leading-[0.68] font-extrabold tracking-tight text-white/[0.04] select-none lg:text-[18vw]"
      >
        Pzee
      </div>
    </footer>
  );
}
