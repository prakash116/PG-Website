import Image from "next/image";
import Link from "next/link";
import brandLogo from "@/public/logo.png";
import { cn } from "@/lib/utils";

/** Shared image mark used in the site logo and login panel. */
export function PzzeeMark({ className }: { className?: string }) {
  return (
    <Image
      src={brandLogo}
      alt=""
      aria-hidden="true"
      className={cn("size-11 shrink-0 rounded-xl object-contain", className)}
    />
  );
}

interface LogoProps {
  /** "dark" renders a dark wordmark for light surfaces, "light" for dark surfaces */
  tone?: "dark" | "light";
  className?: string;
}

export function Logo({ tone = "dark", className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Pzzee — home"
      className={cn("flex items-center gap-2.5", className)}
    >
      <PzzeeMark />
      <span
        className={cn(
          "font-display text-2xl font-extrabold tracking-tight",
          tone === "light" ? "text-white" : "text-foreground"
        )}
      >
        Pzzee
      </span>
    </Link>
  );
}
