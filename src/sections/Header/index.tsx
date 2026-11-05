import { useState } from "react";
import { HeaderLogo } from "@/sections/Header/components/HeaderLogo";
import { HeaderNav } from "@/sections/Header/components/HeaderNav";

type HeaderProps = {
  activePage?: "home" | "events" | "donations" | "about" | "membership";
};

export const Header = ({ activePage = "home" }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-sky-300 shadow-lg relative z-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-[70px] sm:h-[84px] flex items-center justify-between">
        <HeaderLogo />

        {/* Desktop nav */}
        <div className="hidden md:block">
          <HeaderNav activePage={activePage} />
        </div>

        {/* Hamburger button — mobile only */}
        <button
          className="md:hidden flex flex-col justify-center items-center gap-[5px] w-10 h-10 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={`block w-6 h-0.5 bg-white rounded transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white rounded transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white rounded transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {/* Mobile nav drawer */}
      <div
        id="mobile-nav"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-sky-400 ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-4 pb-4 pt-2">
          <HeaderNav activePage={activePage} mobile onClose={() => setMenuOpen(false)} />
        </div>
      </div>
    </header>
  );
};
