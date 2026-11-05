export const HeroContent = () => {
  return (
    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8 flex flex-col gap-2">
      <h1 className="text-white text-xl sm:text-2xl font-bold leading-7 sm:leading-8 max-w-xl">
        We are a community of doers and dreamers
      </h1>
      <p className="text-white text-base sm:text-lg leading-6 sm:leading-7 max-w-xl">
        Join us at our next event and be part of the Jaguar Nation
      </p>
      <div className="flex flex-wrap items-center gap-3 mt-2 sm:absolute sm:right-8 sm:bottom-8 sm:mt-0">
        <a
          href="https://giv.li/pyn4on"
          className="flex items-center gap-2 bg-amber-400 text-blue-800 text-sm font-medium px-4 h-10 rounded-lg hover:bg-amber-300 transition-colors shadow"
        >
          <img
            src="https://c.animaapp.com/mn1akxqgCOQKlW/assets/70ff7eb8da2efd8d7e6ef741a0bc28c2a9690db2.svg"
            alt=""
            className="w-5 h-5"
          />
          Make a Donation
        </a>
        <a
          href="/events"
          className="flex items-center gap-2 bg-amber-400 text-blue-800 text-sm font-medium px-4 h-10 rounded-lg border border-blue-800 hover:bg-amber-300 transition-colors shadow"
        >
          <img
            src="https://c.animaapp.com/mn1akxqgCOQKlW/assets/ac638e5f31afe30694d4a53f8900f004a67cba8e.svg"
            alt=""
            className="w-5 h-5"
          />
          View Events
        </a>
      </div>
    </div>
  );
};
