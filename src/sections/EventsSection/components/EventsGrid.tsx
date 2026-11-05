import { useQuery } from "@animaapp/playground-react-sdk";
import { EventCard } from "@/sections/EventsSection/components/EventCard";

const toDateLabel = (
  rawStartDate: Date | string,
  rawEndDate?: Date | string,
  conferenceDate?: string,
): string => {
  if (conferenceDate) return conferenceDate;
  const start = new Date(rawStartDate);
  if (Number.isNaN(start.getTime())) return "";
  const startText = start.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  if (!rawEndDate) return startText;
  const end = new Date(rawEndDate);
  if (Number.isNaN(end.getTime())) return startText;
  const endText = end.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `${startText} – ${endText}`;
};

export const EventsGrid = () => {
  const { data, isPending } = useQuery("Event", {
    orderBy: { date: "asc" },
    limit: 3,
  });

  if (isPending) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <EventCard
          date="Loading..."
          title="Loading event"
          description="Please wait while events load."
        />
        <EventCard
          date="Loading..."
          title="Loading event"
          description="Please wait while events load."
        />
        <EventCard
          date="Loading..."
          title="Loading event"
          description="Please wait while events load."
        />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <EventCard
          date="April 10, 2026"
          title="Chapter Anniversary Celebration"
          description="Celebrating 71 years!"
        />
        <EventCard
          date="May 16, 2026"
          title="43rd Alumni Bayou Bash"
          description="Nostalgic authentic Louisiana culture, right in the heart of Dallas."
        />
        <EventCard
          date="July 23 - 26, 2026"
          title="2026 National Conference"
          conferenceLink="https://www.suafwdc.com/events/2026-national-conference"
          conferenceLinkText="2026 National Conference"
          conferenceDate="Jul 23, 2026 – Jul 26, 2026"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((event) => {
        const date = toDateLabel(
          event.date,
          event.endDate,
          event.conferenceDate,
        );
        const isConference = event.category === "Conference";
        return (
          <EventCard
            key={event.id}
            date={date}
            title={event.title}
            description={event.description}
            conferenceLink={isConference ? event.registrationLink : undefined}
            conferenceLinkText={
              isConference ? event.conferenceLinkText || "Register" : undefined
            }
            conferenceDate={isConference ? date : undefined}
          />
        );
      })}
    </div>
  );
};
