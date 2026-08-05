"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { Send } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      { label: "About Us", href: "/#why-pzzee" },
      { label: "Contact", href: "/#faq" },
      { label: "Careers", href: "/#why-pzzee" },
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
  function handleSubscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email") as string;
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("You're subscribed! PG updates are on their way.");
    form.reset();
  }

  return (
    <footer className="overflow-hidden bg-ink text-white/75">
      <div className="container-page pt-16 pb-10 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Logo tone="light" />
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-white/60">
              Helping you discover trusted PGs and rooms without the usual
              hassle.
            </p>
            <div className="mt-6 flex gap-2.5">
              {SOCIALS.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-full bg-white/5 text-white/75 transition-colors hover:bg-primary hover:text-primary-foreground"
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
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[15px] text-white/60 transition-colors hover:text-white"
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
        <div className="mt-14 flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-white">
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
              className="h-12 flex-1 rounded-full border-white/15 bg-white/10 px-5 text-white placeholder:text-white/40"
            />
            <Button
              type="submit"
              className="h-12 shrink-0 rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Subscribe
              <Send className="size-4" data-icon="inline-end" />
            </Button>
          </form>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/45 sm:flex-row">
          <p>© 2026 Pzzee. All rights reserved.</p>
          <p>
            Made for students & professionals across India{" "}
            <span aria-hidden="true">🇮🇳</span>
          </p>
        </div>
      </div>

      {/* Oversized watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none -mb-[4vw] text-center font-display text-[22vw] leading-[0.75] font-extrabold tracking-tight text-white/[0.04] select-none"
      >
        pzzee
      </div>
    </footer>
  );
}
