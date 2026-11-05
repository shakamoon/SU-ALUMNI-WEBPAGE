import { usePageMeta } from "@/hooks/usePageMeta";
import { Header } from "@/sections/Header";
import { Hero } from "@/sections/Hero";
import { StatsGrid } from "@/sections/StatsGrid";
import { EventsSection } from "@/sections/EventsSection";
import { MembershipBanner } from "@/sections/MembershipBanner";
import { ImpactSection } from "@/sections/ImpactSection";
import { Footer } from "@/sections/Footer";

export const HomePage = () => {
  usePageMeta({
    title: "Home",
    description:
      "Southern University Alumni - Dallas Chapter connects Jaguar alumni through events, scholarships, fellowship, and community impact across DFW.",
    ogUrl: "https://suafdfw.org/",
    canonical: "https://suafdfw.org/",
  });

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white font-inter">
      <Header activePage="home" />
      <Hero />
      <StatsGrid />
      <EventsSection />
      <MembershipBanner />
      <ImpactSection />
      <Footer />
    </div>
  );
};
