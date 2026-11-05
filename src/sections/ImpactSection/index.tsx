import { ImpactContent } from "@/sections/ImpactSection/components/ImpactContent";
import { ImpactImage } from "@/sections/ImpactSection/components/ImpactImage";

export const ImpactSection = () => {
  return (
    <section className="w-full bg-white">
      <div className="max-w-screen-xl mx-auto px-6 py-16 flex flex-col gap-12">
        <ImpactContent />
        <ImpactImage />
      </div>
    </section>
  );
};
