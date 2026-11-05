import { HeroContent } from "@/sections/Hero/components/HeroContent";

export const Hero = () => {
  return (
    <section className="relative w-full h-[429px] overflow-hidden shadow-xl">
      <img
        src="https://c.animaapp.com/mn1akxqgCOQKlW/assets/7b160839e993f9a90cfd3e5ec15b9422932655e0.png"
        alt="Alumni group photo"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <HeroContent />
    </section>
  );
};
