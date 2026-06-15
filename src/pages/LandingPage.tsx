import { HeroSection } from "../components/HeroSection";
import { ReflectionRuntimePanel } from "../components/ReflectionRuntimePanel";
import { RuntimeBoundaryNotice } from "../components/RuntimeBoundaryNotice";

export function LandingPage() {
  return (
    <main className="landing-page">
      <HeroSection />
      <RuntimeBoundaryNotice />
      <ReflectionRuntimePanel />
    </main>
  );
}