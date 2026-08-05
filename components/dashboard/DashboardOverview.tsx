interface DashboardMetric {
  label: string;
  value: string;
  description: string;
}

interface DashboardOverviewProps {
  eyebrow: string;
  title: string;
  description: string;
  metrics: DashboardMetric[];
}

export function DashboardOverview({
  eyebrow,
  title,
  description,
  metrics,
}: DashboardOverviewProps) {
  return (
    <div className="bg-secondary/40 px-4 pt-28 pb-20">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border bg-card p-7 shadow-[0_24px_64px_rgb(38_22_10/0.08)] sm:p-10">
          <p className="text-sm font-bold tracking-[0.16em] text-brand-ink uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-2xl border bg-background p-5"
              >
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-2 font-display text-3xl font-extrabold">
                  {metric.value}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {metric.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-dashed bg-secondary/40 px-6 py-10 text-center">
            <h2 className="font-display text-lg font-bold">Dashboard ready</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This placeholder confirms role-based login and routing. Dashboard
              data can be connected as its APIs are added.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
