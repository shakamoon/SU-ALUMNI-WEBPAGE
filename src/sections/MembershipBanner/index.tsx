export const MembershipBanner = () => {
  return (
    <div className="w-full bg-white py-6 px-6">
      <div className="max-w-screen-xl mx-auto">
        <a
          href="/membership"
          className="block w-full rounded-2xl bg-amber-400 hover:bg-amber-300 transition-colors"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="text-blue-800 text-lg sm:text-xl font-semibold font-inter tracking-tight leading-7">
              Join Today: Membership Link
            </p>
            <div className="bg-blue-800 text-white text-sm font-medium font-inter px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors shrink-0">
              Join Now →
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};
