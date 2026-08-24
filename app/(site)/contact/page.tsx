import type { Metadata } from "next";
import { Clock, Mail, MessageSquare } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Ask Pzee anything about finding or listing a PG.",
};

const REACH_US = [
  {
    icon: Clock,
    title: "We reply within a few hours",
    description: "Every day of the week, not just weekdays.",
  },
  {
    icon: Mail,
    title: "support@restocare.in",
    description: "If you would rather write to us directly.",
  },
];

export default function ContactPage() {
  return (
    <section className="container-page pt-28 pb-20 sm:pt-32">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-brand-ink uppercase">
            Contact us
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Still have questions?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Tell us what you need and we will call you back on the number you
            leave. Residents and PG owners both welcome.
          </p>

          <div className="mt-8 grid gap-3">
            {REACH_US.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-2xl border bg-card p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <item.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-start gap-3 rounded-2xl border border-dashed bg-card p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <MessageSquare className="size-5" />
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Already a PG owner? Raising a query from your dashboard reaches us
              with your PG attached, which is usually faster.
            </p>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
