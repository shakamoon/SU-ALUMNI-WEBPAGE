export const EventsHeader = () => {
  return (
    <div className="flex items-end justify-between">
      <div className="flex flex-col gap-1">
        <h2 className="text-blue-800 text-4xl font-medium font-inter leading-10">
          Upcoming Events
        </h2>
        <p className="text-gray-600 text-base font-inter leading-6">
          Stay connected with the Jaguar community
        </p>
      </div>
      <a href="/events" className="h-9 px-4 rounded-lg border border-blue-800 bg-white text-blue-800 text-sm font-medium font-inter hover:bg-blue-50 transition-colors shrink-0 flex items-center">
        View All Events
      </a>
    </div>
  );
};
