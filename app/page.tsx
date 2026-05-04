import { ShaderAnimation } from "@/components/landing/ShaderAnimation";
import { LandingNav } from "@/components/landing/LandingNav";
import { AnimatedHeroText } from "@/components/landing/AnimatedHeroText";

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col">
      <LandingNav />
      <div className="flex-grow relative">
        <ShaderAnimation />
        <div className="absolute inset-0">
          <AnimatedHeroText />
        </div>
      </div>
    </div>
  );
}
