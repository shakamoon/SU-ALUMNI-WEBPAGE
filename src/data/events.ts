export type EventCategory = "chapter" | "social" | "conference";

export type EventItem = {
  id: string;
  title: string;
  date: string;
  dateISO: string; // for sorting / filtering
  endDateISO?: string;
  location: string;
  category: EventCategory;
  description: string;
  registrationUrl?: string;
  registrationLabel?: string;
  isFeatured?: boolean;
};

export const ALL_EVENTS: EventItem[] = [
  {
    id: "anniversary-2026",
    title: "Chapter Anniversary Celebration",
    date: "April 10, 2026",
    dateISO: "2026-04-10",
    location: "Dallas, TX",
    category: "chapter",
    description:
      "Join us as we proudly celebrate 71 years of the Southern University Alumni - Dallas Chapter. An evening of reflection, recognition, and fellowship honoring our legacy and the alumni who built it.",
    registrationUrl: "#",
    registrationLabel: "RSVP Now",
    isFeatured: true,
  },
  {
    id: "bayou-bash-2026",
    title: "43rd Alumni Bayou Bash",
    date: "May 16, 2026",
    dateISO: "2026-05-16",
    location: "Dallas, TX",
    category: "social",
    description:
      "Nostalgic authentic Louisiana culture right in the heart of Dallas. Expect great food, live music, and the warmth of Jaguar pride. A can&#39;t-miss night for the whole family.",
    registrationUrl: "#",
    registrationLabel: "Get Tickets",
    isFeatured: true,
  },
  {
    id: "national-conf-2026",
    title: "2026 National Conference",
    date: "July 23 – 26, 2026",
    dateISO: "2026-07-23",
    endDateISO: "2026-07-26",
    location: "Washington, D.C.",
    category: "conference",
    description:
      "The annual gathering of Southern University alumni from across the nation. Four days of leadership sessions, networking, and civic engagement in the nation&#39;s capital.",
    registrationUrl: "https://www.suafwdc.com/events/2026-national-conference",
    registrationLabel: "Register",
    isFeatured: true,
  },
];

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  chapter: "Chapter",
  social: "Social",
  conference: "Conference",
};

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  chapter: "bg-blue-100 text-blue-800",
  social: "bg-amber-100 text-amber-800",
  conference: "bg-purple-100 text-purple-800",
};
