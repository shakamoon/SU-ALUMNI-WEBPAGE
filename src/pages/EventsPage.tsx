import { useMemo, useState } from "react";
import { useQuery } from "@animaapp/playground-react-sdk";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";

type EventCategory =
  | "All"
  | "Social"
  | "Conference"
  | "Community"
  | "Anniversary";

type EventViewModel = {
  id: string;
  date: string;
  month: string;
  day: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  registrationLink?: string;
  externalLink?: string;
  featured?: boolean;
};

const FALLBACK_EVENTS: EventViewModel[] = [
  {
    id: "chapter-anniversary",
    date: "April 10, 2026",
    month: "APR",
    day: "10",
    title: "Chapter Anniversary Celebration",
    description:
      "Join us as we celebrate 71 years of the Southern University Alumni - Dallas Chapter! An evening of fellowship, reflection, and Jaguar pride honoring our legacy and the alumni who built it.",
    category: "Anniversary",
    location: "Dallas, TX",
    featured: true,
    registrationLink: "#",
  },
  {
    id: "bayou-bash",
    date: "May 16, 2026",
    month: "MAY",
    day: "16",
    title: "43rd Alumni Bayou Bash",
    description:
      "Nostalgic authentic Louisiana culture, right in the heart of Dallas. Enjoy incredible food, live music, and reconnect with fellow Jaguars at our beloved annual bash.",
    category: "Social",
    location: "Dallas, TX",
    featured: true,
    registrationLink: "#",
  },
  {
    id: "national-conference",
    date: "July 23 – 26, 2026",
    month: "JUL",
    day: "23",
    title: "2026 National Conference",
    description:
      "The premier gathering of Southern University alumni from across the country. Four days of leadership sessions, networking, cultural programming, and celebrating the Jaguar Nation.",
    category: "Conference",
    location: "Washington, D.C.",
    featured: true,
    registrationLink: "https://www.suafwdc.com/events/2026-national-conference",
    externalLink: "https://www.suafwdc.com/events/2026-national-conference",
  },
];

const CATEGORIES: EventCategory[] = [
  "All",
  "Social",
  "Conference",
  "Community",
  "Anniversary",
];

const categoryBadgeColors: Record<string, string> = {
  Social: "bg-amber-100 text-amber-800",
  Conference: "bg-blue-100 text-blue-800",
  Community: "bg-green-100 text-green-800",
  Anniversary: "bg-purple-100 text-purple-800",
};

const normalizeCategory = (category?: string): EventCategory => {
  if (category === "Social") return "Social";
  if (category === "Conference") return "Conference";
  if (category === "Community") return "Community";
  if (category === "Anniversary") return "Anniversary";
  return "Community";
};

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

const toMonthAndDay = (
  month: string | undefined,
  day: string | undefined,
  rawDate: Date | string,
) => {
  if (month && day) return { month, day };
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return { month: "TBD", day: "--" };
  }
  return {
    month: parsed.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: String(parsed.getDate()),
  };
};

export const EventsPage = () => {
  usePageMeta({
    title: "Events",
    description:
      "Explore upcoming Southern University Alumni - Dallas Chapter events including social gatherings, conferences, service days, and scholarship initiatives.",
    ogUrl: "https://suafdfw.org/events",
    canonical: "https://suafdfw.org/events",
  });

  const [activeCategory, setActiveCategory] = useState<EventCategory>("All");
  const [search, setSearch] = useState("");

  const {
    data: dbEvents,
    isPending,
    error,
  } = useQuery("Event", {
    orderBy: { date: "asc" },
  });

  const normalizedEvents = useMemo<EventViewModel[]>(() => {
    if (!dbEvents || dbEvents.length === 0) return FALLBACK_EVENTS;

    return dbEvents.map((event) => {
      const date = toDateLabel(event.date, event.endDate, event.conferenceDate);
      const monthAndDay = toMonthAndDay(event.month, event.day, event.date);
      const category = normalizeCategory(event.category);
      const registrationLink = event.registrationLink;
      const externalLink =
        registrationLink && registrationLink.startsWith("http")
          ? registrationLink
          : undefined;

      return {
        id: event.id,
        date,
        month: monthAndDay.month,
        day: monthAndDay.day,
        title: event.title,
        description: event.description || "",
        category,
        location: event.location,
        registrationLink,
        externalLink,
        featured: category === "Conference" || category === "Anniversary",
      };
    });
  }, [dbEvents]);

  const filtered = normalizedEvents.filter((event) => {
    const matchesCategory =
      activeCategory === "All" || event.category === activeCategory;
    const normalizedSearch = search.toLowerCase();
    const matchesSearch =
      normalizedSearch === "" ||
      event.title.toLowerCase().includes(normalizedSearch) ||
      event.description.toLowerCase().includes(normalizedSearch) ||
      event.location.toLowerCase().includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });

  const featured = filtered.filter((event) => event.featured);
  const rest = filtered.filter((event) => !event.featured);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white font-inter">
      <Header activePage="events" />

      <section className="w-full bg-blue-800 py-14 px-6">
        <div className="max-w-screen-xl mx-auto flex flex-col gap-4">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
            <a href="/" className="hover:underline text-amber-300">
              Home
            </a>
            <span>/</span>
            <span>Events</span>
          </div>
          <h1 className="text-white text-3xl sm:text-5xl font-semibold font-inter leading-tight max-w-2xl">
            Upcoming Events
          </h1>
          <p className="text-blue-200 text-base sm:text-lg font-inter leading-7 max-w-xl">
            Stay connected with the Jaguar community. Find events, register, and
            celebrate together.
          </p>
        </div>
      </section>

      <section className="w-full border-b border-gray-100 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 h-9 rounded-full text-sm font-medium font-inter transition-all border ${
                  activeCategory === cat
                    ? "bg-blue-800 text-white border-blue-800"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-auto">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 h-9 rounded-full border border-gray-200 text-sm font-inter text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 w-full sm:w-52"
            />
          </div>
        </div>
      </section>

      <main className="w-full bg-gray-50 py-12 px-6">
        <div className="max-w-screen-xl mx-auto flex flex-col gap-12">
          {isPending && (
            <p className="text-gray-500 text-sm">
              Loading events from database...
            </p>
          )}

          {error && (
            <p className="text-red-600 text-sm">
              Could not load events from database: {error.message}
            </p>
          )}

          {filtered.length === 0 && !isPending && (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <p className="text-gray-500 text-lg font-inter">
                No events found matching your search.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="text-blue-700 text-sm font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

          {featured.length > 0 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-blue-800 text-2xl font-semibold font-inter">
                Featured Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((event) => (
                  <FeaturedEventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {rest.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-blue-800 text-2xl font-semibold font-inter">
                More Events
              </h2>
              <div className="flex flex-col gap-4">
                {rest.map((event) => (
                  <ListEventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

const FeaturedEventCard = ({ event }: { event: EventViewModel }) => (
  <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col items-center justify-center bg-blue-800 text-white rounded-xl w-14 h-14 shrink-0">
        <span className="text-[10px] font-semibold font-inter leading-none uppercase tracking-wider text-blue-200">
          {event.month}
        </span>
        <span className="text-2xl font-bold font-inter leading-none">
          {event.day}
        </span>
      </div>
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium font-inter ${categoryBadgeColors[event.category] ?? "bg-gray-100 text-gray-600"}`}
      >
        {event.category}
      </span>
    </div>

    <div className="flex flex-col gap-1.5 flex-1">
      <h3 className="text-blue-800 text-base font-semibold font-inter leading-snug">
        {event.title}
      </h3>
      <div className="flex items-center gap-1.5 text-gray-400 text-xs font-inter">
        <svg
          className="w-3.5 h-3.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z"
          />
        </svg>
        {event.location}
      </div>
      <p className="text-gray-500 text-sm font-inter leading-6 mt-1">
        {event.description}
      </p>
    </div>

    <div className="flex items-center gap-3 mt-auto pt-2 border-t border-gray-100">
      <span className="text-amber-500 text-xs font-medium font-inter">
        {event.date}
      </span>
      {event.registrationLink && (
        <a
          href={event.registrationLink}
          target={event.externalLink ? "_blank" : undefined}
          rel={event.externalLink ? "noopener noreferrer" : undefined}
          className="ml-auto flex items-center gap-1 bg-blue-800 hover:bg-blue-700 text-white text-xs font-semibold font-inter px-3 py-1.5 rounded-lg transition-colors"
        >
          {event.externalLink ? "Learn More" : "Register"}
        </a>
      )}
    </div>
  </div>
);

const ListEventCard = ({ event }: { event: EventViewModel }) => (
  <div className="bg-white rounded-2xl border border-black/10 px-6 py-5 flex items-center gap-6 hover:shadow-md transition-shadow">
    <div className="flex flex-col items-center justify-center bg-gray-100 text-blue-800 rounded-xl w-14 h-14 shrink-0">
      <span className="text-[10px] font-semibold font-inter leading-none uppercase tracking-wider text-gray-400">
        {event.month}
      </span>
      <span className="text-2xl font-bold font-inter leading-none">
        {event.day}
      </span>
    </div>

    <div className="flex-1 flex flex-col gap-0.5">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-blue-800 text-sm font-semibold font-inter">
          {event.title}
        </h3>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium font-inter ${categoryBadgeColors[event.category] ?? "bg-gray-100 text-gray-600"}`}
        >
          {event.category}
        </span>
      </div>
      <p className="text-gray-400 text-xs font-inter">
        {event.location} · {event.date}
      </p>
      <p className="text-gray-500 text-sm font-inter leading-5 mt-1 line-clamp-1">
        {event.description}
      </p>
    </div>

    {event.registrationLink && (
      <a
        href={event.registrationLink}
        target={event.externalLink ? "_blank" : undefined}
        rel={event.externalLink ? "noopener noreferrer" : undefined}
        className="shrink-0 border border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white text-xs font-semibold font-inter px-4 py-2 rounded-lg transition-colors"
      >
        {event.externalLink ? "Learn More" : "Register"}
      </a>
    )}
  </div>
);
