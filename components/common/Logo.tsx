import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Pzzee monogram — a rounded "P" whose bowl doubles as an open door.
 * Swap the <svg> below with the final brand SVG when it is ready;
 * the mark is exported separately so it can be reused as an app icon.
 */
export function PzzeeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("size-9 shrink-0", className)}
    >
      <rect width="40" height="40" rx="12" className="fill-primary" />
      <path
        d="M14 30V11a1 1 0 0 1 1-1h7.5a6.5 6.5 0 0 1 0 13H18v7"
        fill="none"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="27.5" cy="27.5" r="3.5" className="fill-success" />
      <path
        d="M26 27.5l1.1 1.1 2-2.1"
        fill="none"
        stroke="white"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
