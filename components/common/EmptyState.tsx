import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed bg-secondary/60 px-6 py-16 text-center",
        className
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="size-7" />
      </div>
      <h3 className="mt-5 font-display text-lg font-bold text-foreground">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6 h-10 rounded-full px-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
