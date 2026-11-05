import { useAuth, useQuery } from "@animaapp/playground-react-sdk";
import { PHP_BACKEND_LINKS } from "@/config/backend";
import { StatCard } from "@/sections/StatsGrid/components/StatCard";

const FALLBACK_STATS = [
  {
    imageSrc:
      "https://c.animaapp.com/mn1akxqgCOQKlW/assets/6165bf737909f5201762145951efcdb46cc09f67.svg",
    statValue: "200+",
    statLabel: "Active Alumni",
  },
  {
    imageSrc:
      "https://c.animaapp.com/mn1akxqgCOQKlW/assets/ca21947efb8198435c411542f771b4f611450e71.svg",
    statValue: "$300K+",
    statLabel: "Scholarships Awarded",
  },
  {
    imageSrc:
      "https://c.animaapp.com/mn1akxqgCOQKlW/assets/0f2fe844d24c13b75eb5b6b48c971ec8d6f46344.svg",
    statValue: "2+",
    statLabel: "Annual Events",
  },
  {
    imageSrc:
      "https://c.animaapp.com/mn1akxqgCOQKlW/assets/fe5c7ae3172f59c5274722c718c3841d98858f23.svg",
    statValue: "$1M+",
    statLabel: "Total Donations",
  },
];

export const StatsGrid = () => {
  const { user, isPending: isAuthPending } = useAuth();
  const { data, isPending, error } = useQuery("Stat", {
    orderBy: { createdAt: "asc" },
  });

  const stats = data && data.length > 0 ? data : FALLBACK_STATS;
  const canManageStats = !isAuthPending && Boolean(user);

  return (
    <section className="w-full bg-white py-16 px-6">
      <div className="max-w-screen-xl mx-auto flex flex-col gap-6">
        {isPending && (
          <p className="text-sm text-gray-500 text-center">
            Loading stats from database...
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 text-center">
            Could not load stats from database: {error.message}
          </p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((item) => (
            <StatCard
              key={`${item.statLabel}-${item.statValue}`}
              imageSrc={item.imageSrc}
              statValue={item.statValue}
              statLabel={item.statLabel}
            />
          ))}
        </div>

        {canManageStats && (
          <a
            href={PHP_BACKEND_LINKS.stats}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto text-sm text-blue-700 hover:text-blue-800 underline"
          >
            Update stats in PHP backend
          </a>
        )}
      </div>
    </section>
  );
};
