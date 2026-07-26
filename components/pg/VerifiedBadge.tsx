import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export function VerifiedBadge({ size = "sm", className }: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-success font-semibold text-success-foreground",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        className
      )}
    >
      <BadgeCheck className={size === "sm" ? "size-3.5" : "size-4"} />
      Verified
    </span>
  );
}
