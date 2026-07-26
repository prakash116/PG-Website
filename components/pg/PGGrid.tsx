import type { PG } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PGCard } from "@/components/pg/PGCard";
import { StaggerGroup, StaggerItem } from "@/components/common/AnimatedSection";

interface PGGridProps {
  pgs: PG[];
  columns?: 2 | 3;
  className?: string;
}

export function PGGrid({ pgs, columns = 3, className }: PGGridProps) {
  return (
    <StaggerGroup
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        className
      )}
    >
      {pgs.map((pg) => (
        <StaggerItem key={pg.id} className="h-full">
          <PGCard pg={pg} className="h-full" />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
