import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { faqs } from "@/data/faq";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/common/AnimatedSection";

export function FAQ() {
  return (
    <section id="faq" className="container-page scroll-mt-24 py-20 sm:py-24">
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-x-20 lg:gap-y-8">
        {/* Heading */}
        <AnimatedSection className="lg:col-start-1 lg:row-start-1">
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-brand-ink uppercase">
            Good to know
          </p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Everything you need to know about finding, comparing and moving
            into a PG with Pzee.
          </p>
        </AnimatedSection>

        {/* Accordion comes before support on mobile and stays on the right on desktop */}
        <AnimatedSection
          delay={0.1}
          className="lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <Accordion className="rounded-3xl border bg-card px-6 py-2 sm:px-8">
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="py-5 text-[15px] font-semibold hover:no-underline sm:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>

        {/* Support follows the FAQ list on mobile and remains left on desktop */}
        <AnimatedSection
          delay={0.2}
          className="lg:col-start-1 lg:row-start-2"
        >
          <div className="rounded-3xl border bg-secondary/60 p-6">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <MessageCircle className="size-5" />
            </span>
            <h3 className="mt-4 font-display text-base font-bold">
              Still have questions?
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Our team replies within a few hours, every day of the week.
            </p>
            <Button
              variant="outline"
              render={<Link href="/contact" />}
              className="mt-5 h-10 rounded-full bg-card px-5 text-sm font-semibold"
            >
              Contact Support
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
