import { HeroCarousel } from "@/components/home/HeroCarousel";
import { SearchBar } from "@/components/home/SearchBar";
import { AvailablePG } from "@/components/home/AvailablePG";
import { RoomTypes } from "@/components/home/RoomTypes";
import { BudgetSearch } from "@/components/home/BudgetSearch";
import { WhyPzzee } from "@/components/home/WhyPzzee";
import { VerifiedSection } from "@/components/home/VerifiedSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PopularLocations } from "@/components/home/PopularLocations";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQ } from "@/components/home/FAQ";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <SearchBar />
      <AvailablePG />
      <RoomTypes />
      <BudgetSearch />
      <WhyPzzee />
      <VerifiedSection />
      <HowItWorks />
      <PopularLocations />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  );
}
