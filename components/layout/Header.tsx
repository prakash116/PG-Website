"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Find PG", href: "/pg" },
  { label: "Rooms", href: "/#rooms" },
  { label: "Locations", href: "/#locations" },
  { label: "About", href: "/#why-pzee" },
  { label: "FAQ", href: "/#faq" },
];

const menuPanel = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: "easeIn" as const } },
};

const menuList = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const menuItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation (adjust-state-during-render pattern).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Lock scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // The homepage opens with a dark hero, so the header starts transparent there.
  const transparent = pathname === "/" && !scrolled && !open;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          transparent
            ? "bg-transparent py-2"
            : "border-b border-border/60 bg-background/85 py-0 shadow-[0_1px_12px_rgb(38_22_10/0.04)] backdrop-blur-xl"
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Logo tone={transparent ? "light" : "dark"} />

          <nav
            aria-label="Main"
            className="hidden items-center gap-1 lg:flex"
          >
            {NAV_LINKS.map((link) => {
              const active =
                link.href === pathname ||
                (link.href === "/pg" && pathname.startsWith("/pg"));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    transparent
                      ? "text-white/80 hover:bg-white/10 hover:text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    active &&
                      (transparent
                        ? "bg-white/15 text-white"
                        : "bg-accent text-accent-foreground")
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button
              variant="ghost"
              render={<Link href="/login" />}
              className={cn(
                "h-10 rounded-full px-5 text-sm font-semibold",
                transparent && "text-white hover:bg-white/10 hover:text-white"
              )}
            >
              Login
            </Button>
            <Button
              variant="outline"
              render={<Link href="/register" />}
              className={cn(
                "h-10 rounded-full px-5 text-sm font-semibold",
                transparent &&
                  "border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              )}
            >
              Register
            </Button>
          </div>

          {/* Animated hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn(
              "relative flex size-11 items-center justify-center rounded-full transition-colors lg:hidden",
              transparent ? "text-white hover:bg-white/10" : "text-foreground hover:bg-muted"
            )}
          >
            <span className="relative block h-3.5 w-5">
              <motion.span
                animate={open ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute top-0 left-0 h-0.5 w-5 rounded-full bg-current"
              />
              <motion.span
                animate={open ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute top-1.5 left-0 h-0.5 w-3.5 rounded-full bg-current"
              />
              <motion.span
                animate={open ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute top-3 left-0 h-0.5 w-5 rounded-full bg-current"
              />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={menuPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 flex flex-col bg-background pt-24 lg:hidden"
          >
            <motion.nav
              aria-label="Mobile"
              variants={menuList}
              initial="hidden"
              animate="visible"
              className="container-page flex flex-1 flex-col gap-1 overflow-y-auto pb-8"
            >
              {NAV_LINKS.map((link) => (
                <motion.div key={link.label} variants={menuItem}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-b border-border/70 py-4 font-display text-2xl font-bold text-foreground"
                  >
                    {link.label}
                    <ArrowRight className="size-5 text-muted-foreground" />
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={menuItem} className="mt-8 flex flex-col gap-3">
                <Button
                  render={<Link href="/register" />}
                  onClick={() => setOpen(false)}
                  className="h-12 rounded-full text-base font-semibold"
                >
                  Register
                </Button>
                <Button
                  variant="outline"
                  render={<Link href="/login" />}
                  onClick={() => setOpen(false)}
                  className="h-12 rounded-full text-base font-semibold"
                >
                  Login
                </Button>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
