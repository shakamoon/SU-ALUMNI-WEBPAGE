export type EventCardProps = {
  date: string;
  title: string;
  description?: string;
  conferenceLink?: string;
  conferenceLinkText?: string;
  conferenceDate?: string;
};

export const EventCard = (props: EventCardProps) => {
  return (
    <div className="relative bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <img
          src="https://c.animaapp.com/mn1akxqgCOQKlW/assets/a3299779ed90e8d8feb6cb5529e6ad0766c02427.svg"
          alt=""
          className="w-5 h-5 shrink-0"
        />
        <span className="text-amber-400 text-sm font-inter">{props.date}</span>
      </div>
      <h3 className="text-blue-800 text-sm font-medium font-inter leading-snug">
        {props.title}
      </h3>
      {props.description && (
        <p className="text-gray-500 text-sm font-inter leading-6">{props.description}</p>
      )}
      {props.conferenceLink && (
        <div className="flex flex-col gap-0.5">
          <a
            href={props.conferenceLink}
            className="text-gray-500 text-sm font-inter leading-6 underline hover:text-blue-700 transition-colors"
          >
            {props.conferenceLinkText}
          </a>
          <p className="text-gray-500 text-sm font-inter leading-6">{props.conferenceDate}</p>
        </div>
      )}
    </div>
  );
};
