import { pgs } from "@/data/pg";
import { SectionHeader } from "@/components/common/SectionHeader";
import { PGGrid } from "@/components/pg/PGGrid";

export function AvailablePG() {
  const featured = pgs.slice(0, 6);

  return (
    <section id="available-pg" className="container-page scroll-mt-24 py-20 sm:py-24">
      <SectionHeader
        eyebrow="Handpicked for you"
        title="PGs Available Near You"
        subtitle="Handpicked stays with the comfort, location and amenities you need."
        action={{ label: "View All PGs", href: "/pg" }}
      />
      <PGGrid pgs={featured} />
    </section>
  );
}
