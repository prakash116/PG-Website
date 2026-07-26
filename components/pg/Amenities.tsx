import type { LucideIcon } from "lucide-react";
import {
  Car,
  Cctv,
  Check,
  Droplets,
  Dumbbell,
  Flame,
  LampDesk,
  Refrigerator,
  ShieldCheck,
  ShowerHead,
  Snowflake,
  Sparkles,
  Tv,
  UtensilsCrossed,
  WashingMachine,
  Wifi,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const AMENITY_ICONS: Record<string, LucideIcon> = {
  WiFi: Wifi,
  AC: Snowflake,
  Food: UtensilsCrossed,
  Laundry: WashingMachine,
  Parking: Car,
  "Power Backup": Zap,
  CCTV: Cctv,
  Housekeeping: Sparkles,
  Gym: Dumbbell,
  Fridge: Refrigerator,
  TV: Tv,
  "Hot Water": Flame,
  "Study Table": LampDesk,
  "Attached Bathroom": ShowerHead,
  "Water Purifier": Droplets,
  Security: ShieldCheck,
};

export function amenityIcon(name: string): LucideIcon {
  return AMENITY_ICONS[name] ?? Check;
}

/** Compact inline row of amenity chips — used on PG cards. */
export function AmenityChips({
  amenities,
  max = 4,
  className,
}: {
  amenities: string[];
  max?: number;
  className?: string;
}) {
  const shown = amenities.slice(0, max);
  const rest = amenities.length - shown.length;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {shown.map((name) => {
        const Icon = amenityIcon(name);
        return (
          <span
            key={name}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
          >
            <Icon className="size-3 text-primary" />
            {name}
          </span>
        );
      })}
      {rest > 0 && (
        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          +{rest} more
        </span>
      )}
    </div>
  );
}

/** Full amenity grid — used on the PG detail page. */
export function AmenitiesGrid({
  amenities,
  className,
}: {
  amenities: string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {amenities.map((name) => {
        const Icon = amenityIcon(name);
        return (
          <div
            key={name}
            className="flex items-center gap-2.5 rounded-2xl border bg-card px-3.5 py-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="size-4.5" />
            </span>
            <span className="text-sm font-medium text-foreground">{name}</span>
          </div>
        );
      })}
    </div>
  );
}
