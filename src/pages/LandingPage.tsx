import { HeroSection } from "../components/HeroSection";
import { RuntimeBoundaryNotice } from "../components/RuntimeBoundaryNotice";

export function LandingPage() {
  return (
    <main className="landing-page">
      <HeroSection />
      <RuntimeBoundaryNotice />
    </main>
  );
}