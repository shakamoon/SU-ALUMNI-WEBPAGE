export const HeaderLogo = () => {
  return (
    <a href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
      <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 overflow-hidden rounded-full">
        <img
          alt="SUAF Logo"
          src="https://c.animaapp.com/mn1akxqgCOQKlW/assets/76b2b52d80a069e5a2dddd5760e98ff5b6565ca3.png"
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-white text-base sm:text-xl md:text-2xl font-ga_maamli uppercase tracking-wide leading-tight line-clamp-2">
        Southern University Alumni - Dallas Chapter
      </span>
    </a>
  );
};
