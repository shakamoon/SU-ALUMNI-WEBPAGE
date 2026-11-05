import { useAuth, useQuery } from "@animaapp/playground-react-sdk";
import { PHP_BACKEND_LINKS } from "@/config/backend";
import { ImpactFeature } from "@/sections/ImpactSection/components/ImpactFeature";

const FALLBACK_FEATURES = [
  {
    id: "fallback-1",
    imageSrc:
      "https://c.animaapp.com/mn1akxqgCOQKlW/assets/2c5444d9adf6d161a107f2ab79f19505b58c0126.svg",
    title: "Scholarship Programs",
    description: "Supporting deserving students with financial aid",
  },
  {
    id: "fallback-2",
    imageSrc:
      "https://c.animaapp.com/mn1akxqgCOQKlW/assets/a1084935780a0d3e688b516dde9a1563ebb349db.svg",
    title: "Campus Initiatives",
    description: "Enhancing facilities and student resources",
  },
  {
    id: "fallback-3",
    imageSrc:
      "https://c.animaapp.com/mn1akxqgCOQKlW/assets/c224649e4198dbd04da12b25a2bf04424a53ef6e.svg",
    title: "Alumni Network",
    description: "Building connections that last a lifetime",
  },
];

export const ImpactContent = () => {
  const { user, isPending: isAuthPending } = useAuth();
  const { data, isPending, error } = useQuery("ImpactFeature", {
    orderBy: { createdAt: "asc" },
  });

  const features = data && data.length > 0 ? data : FALLBACK_FEATURES;
  const canManageContent = !isAuthPending && Boolean(user);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-center">
          <img
            src="https://c.animaapp.com/mn1akxqgCOQKlW/img/uploaded-asset-1774334670856-0.png"
            alt="Southern University Alumni Federation Dallas Chapter"
            className="w-72 h-72 object-contain"
          />
        </div>
        <h2 className="text-blue-800 text-4xl font-medium font-inter leading-10">
          Jaguar Nation Makes an Impact Together
        </h2>
        <p className="text-gray-700 text-base font-inter leading-6 max-w-3xl">
          Your support helps Southern University students achieve their dreams
          through scholarships, enhanced facilities, and innovative programs.
          Every contribution makes a difference in shaping the next generation
          of Jaguar leaders.
        </p>
      </div>

      {isPending && (
        <p className="text-sm text-gray-500">
          Loading impact initiatives from database...
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600">
          Could not load impact initiatives from database: {error.message}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {features.map((feature) => (
          <ImpactFeature
            key={feature.id}
            imageSrc={feature.imageSrc}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href="https://giv.li/pyn4on"
          className="inline-flex items-center justify-center bg-blue-800 text-white text-sm font-medium font-inter px-6 h-10 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Support Southern University
        </a>
        {canManageContent && (
          <a
            href={PHP_BACKEND_LINKS.impact}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center border border-blue-800 text-blue-800 text-sm font-medium font-inter px-6 h-10 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Update impact content
          </a>
        )}
      </div>
    </div>
  );
};
