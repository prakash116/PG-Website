import { Construction, type LucideIcon } from "lucide-react";

interface PreviewSectionProps {
  icon: LucideIcon;
  /** What this screen will show once its data source exists. */
  planned: string[];
  /** What has to be built before it can show real numbers. */
  needs: string;
}

/**
 * Used for screens whose data source is not built yet. It states plainly that
 * nothing is connected rather than rendering invented figures — a dashboard
 * showing made-up money is worse than one showing none.
 */
export function PreviewSection({ icon: Icon, planned, needs }: PreviewSectionProps) {
  return (
    <section className="rounded-2xl border border-dashed bg-card p-6 sm:p-8">
      <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </span>

      <h2 className="mt-4 font-display text-lg font-bold">Not connected yet</h2>
      <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
        This screen is designed but has no data behind it. Rather than show
        placeholder numbers that look real, it stays empty until the API is
        built.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
            What it will show
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {planned.map((item) => (
              <li
                key={item}
                className="flex gap-2 text-sm leading-relaxed text-foreground"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
            What it needs first
          </p>
          <p className="mt-2.5 flex gap-2 text-sm leading-relaxed text-muted-foreground">
            <Construction className="mt-0.5 size-4 shrink-0" />
            {needs}
          </p>
        </div>
      </div>
    </section>
  );
}
