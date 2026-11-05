export const FooterBrand = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
      {/* Brand */}
      <div className="flex flex-col gap-4">
        <p className="text-white text-lg font-medium font-inter leading-7">
          Southern University Alumni - Dallas Chapter
        </p>
        <p className="text-gray-300 text-sm font-inter leading-5 max-w-[243px]">
          Connecting Jaguars across generations and supporting our beloved
          institution.
        </p>
      </div>

      {/* Quick Links */}
      <div className="flex flex-col gap-4">
        <p className="text-amber-400 text-lg font-medium font-inter leading-7">
          Quick Links
        </p>
        <div className="flex flex-col gap-2">
          {["Home", "Events", "Donations", "About"].map((link) => (
            <a
              key={link}
              href={link === "Home" ? "/" : `/${link.toLowerCase()}`}
              className="text-white text-sm font-inter leading-5 hover:text-amber-400 transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="flex flex-col gap-4">
        <p className="text-amber-400 text-lg font-medium font-inter leading-7">
          Contact
        </p>
        <div className="flex flex-col gap-2">
          <p className="text-gray-300 text-sm font-inter leading-5">
            P.O. Box 700596
          </p>
          <p className="text-gray-300 text-sm font-inter leading-5">
            Dallas, TX 75370
          </p>
          <a
            href="mailto:suafdallas@yahoo.com"
            className="text-gray-300 text-sm font-inter leading-5 hover:text-amber-400 transition-colors"
          >
            suafdallas@yahoo.com
          </a>
        </div>
      </div>
    </div>
  );
};
