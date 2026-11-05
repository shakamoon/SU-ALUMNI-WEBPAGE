import { EventsHeader } from "@/sections/EventsSection/components/EventsHeader";
import { EventsGrid } from "@/sections/EventsSection/components/EventsGrid";

export const EventsSection = () => {
  return (
    <section className="w-full bg-gray-50 py-12 px-6">
      <div className="max-w-screen-xl mx-auto flex flex-col gap-8">
        <EventsHeader />
        <EventsGrid />
      </div>
    </section>
  );
};
