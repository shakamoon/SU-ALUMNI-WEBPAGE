import { FooterBrand } from "@/sections/Footer/components/FooterBrand";
import { FooterCopyright } from "@/sections/Footer/components/FooterCopyright";

export const Footer = () => {
  return (
    <footer className="w-full bg-blue-800 pt-12 px-6 pb-6">
      <div className="max-w-screen-xl mx-auto flex flex-col gap-8">
        <FooterBrand />
        <FooterCopyright />
      </div>
    </footer>
  );
};
