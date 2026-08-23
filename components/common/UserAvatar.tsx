import { cn } from "@/lib/utils";

interface UserAvatarProps {
  /** Uploaded photo. Falls back to initials when absent. */
  src: string | null;
  /** Full name, from which the initials are taken. */
  name: string;
  className?: string;
}

/** "Aarav Sharma" → "AS", "Priya" → "P". */
export function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Someone's photo, or their initials. Shared by the site header, the account
 * page and the owner dashboard so a person looks the same everywhere they
 * appear.
 */
export function UserAvatar({ src, name, className }: UserAvatarProps) {
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent font-display text-sm font-extrabold text-accent-foreground",
        className
      )}
    >
      {src ? (
        // Remote Cloudinary URL, so a plain img avoids next/image host config.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        initialsOf(name) || "PZ"
      )}
    </span>
  );
}
