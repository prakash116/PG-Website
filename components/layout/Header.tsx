"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, LoaderCircle, LogOut, UserRound } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { Button } from "@/components/ui/button";
import { getAccountMenu } from "@/lib/auth/account-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

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
  const isSessionResolved = useAuthStore((state) => state.isSessionResolved);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // The header is on every page, so this is where the session cookie is checked
  // once per load — which also extends it by another 30 days.
  const loadSession = useAuthStore((state) => state.loadSession);
  useEffect(() => {
    void loadSession();
  }, [loadSession]);

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

  async function handleMobileLogout() {
    await logout();
    toast.success("Logged out.");
    setOpen(false);
  }

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

          {/* Rendered only once the session is known, so the buttons never
              flip from Login/Register to the profile icon after load. */}
          <div className="hidden min-h-10 items-center gap-2 lg:flex">
            {isSessionResolved &&
              (isAuthenticated ? (
                <ProfileMenu transparent={transparent} />
              ) : (
                <>
                  <Button
                    variant="ghost"
                    render={<Link href="/login" />}
                    className={cn(
                      "h-10 rounded-full px-5 text-sm font-semibold",
                      transparent &&
                        "text-white hover:bg-white/10 hover:text-white"
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
                </>
              ))}
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
                {isSessionResolved &&
                  (isAuthenticated && user ? (
                    <>
                      <div className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                          <UserRound className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {[user.firstName, user.lastName]
                              .filter(Boolean)
                              .join(" ")}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* The same items as the desktop dropdown, from the same
                          definition, so the two cannot say different things. */}
                      {getAccountMenu(user.role).map((item) =>
                        item.href ? (
                          <Button
                            key={item.label}
                            variant="outline"
                            render={<Link href={item.href} />}
                            onClick={() => setOpen(false)}
                            className="h-12 justify-start gap-3 rounded-full px-5 text-base font-semibold"
                          >
                            <item.icon className="size-4.5 text-muted-foreground" />
                            {item.label}
                          </Button>
                        ) : (
                          <Button
                            key={item.label}
                            variant="outline"
                            disabled
                            className="h-12 justify-start gap-3 rounded-full px-5 text-base font-semibold"
                          >
                            <item.icon className="size-4.5 text-muted-foreground" />
                            {item.label}
                            {item.soon && (
                              <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[0.625rem] font-semibold tracking-wide text-secondary-foreground uppercase">
                                Soon
                              </span>
                            )}
                          </Button>
                        )
                      )}

                      <Button
                        variant="outline"
                        disabled={isLoggingOut}
                        onClick={() => void handleMobileLogout()}
                        className="h-12 gap-2 rounded-full text-base font-semibold text-destructive"
                      >
                        {isLoggingOut ? (
                          <LoaderCircle className="size-4.5 animate-spin" />
                        ) : (
                          <LogOut className="size-4.5" />
                        )}
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </Button>
                    </>
                  ) : (
                    <>
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
                    </>
                  ))}
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
