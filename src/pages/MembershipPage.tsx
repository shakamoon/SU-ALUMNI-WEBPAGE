import { useEffect } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";

const JoinItWidget = () => {
  useEffect(() => {
    const scriptSrc =
      "https://app.joinit.com/embed/widget/9dHscTRtK27zTXheK/embedCode";
    if (document.querySelector(`script[src="${scriptSrc}"]`)) return;

    const script = document.createElement("script");
    script.src = scriptSrc;
    document.head.appendChild(script);

    const messageHandler = (event: MessageEvent) => {
      if (event.data === "request-url") {
        (event.source as WindowProxy).postMessage(
          window.location.href,
          event.origin,
        );
      }
    };
    window.addEventListener("message", messageHandler);
    return () => window.removeEventListener("message", messageHandler);
  }, []);

  return (
    <div id="joinit-widget-9dHscTRtK27zTXheK">
      <noscript>
        View{" "}
        <a href="https://app.joinit.com/o/southern-university-alumni-federation-dallas-chapter">
          Membership Website
        </a>{" "}
        powered by{" "}
        <a href="https://joinit.com">Membership Software by Join It</a>
      </noscript>
    </div>
  );
};

const BENEFITS_OVERVIEW = [
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0z"
        />
      </svg>
    ),
    title: "Community & Fellowship",
    description:
      "Connect with hundreds of Southern University alumni across the Dallas area at exclusive chapter events, social mixers, and community initiatives.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
        />
      </svg>
    ),
    title: "Scholarship Support",
    description:
      "Your dues directly fund scholarships for deserving Southern University students. Every membership contributes to the next generation of Jaguars.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
        />
      </svg>
    ),
    title: "Professional Networking",
    description:
      "Access our exclusive alumni directory and leverage a powerful professional network of Jaguars spanning every industry across the Dallas metro and beyond.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
        />
      </svg>
    ),
    title: "Legacy & Recognition",
    description:
      "Become part of a proud 70+ year chapter legacy. Your membership keeps this chapter strong for future generations of Southern University alumni.",
  },
];

export const MembershipPage = () => {
  usePageMeta({
    title: "Membership",
    description:
      "Join the Southern University Alumni - Dallas Chapter to support scholarships, build professional connections, and strengthen Jaguar legacy in DFW.",
    ogUrl: "https://suafdfw.org/membership",
    canonical: "https://suafdfw.org/membership",
  });

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white font-inter">
      <Header activePage="membership" />

      {/* Page Hero */}
      <section className="w-full bg-blue-800 py-14 px-6">
        <div className="max-w-screen-xl mx-auto flex flex-col gap-4">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
            <a href="/" className="hover:underline text-amber-300">
              Home
            </a>
            <span>/</span>
            <span>Membership</span>
          </div>
          <h1 className="text-white text-3xl sm:text-5xl font-semibold font-inter leading-tight max-w-2xl">
            Join the Jaguar Family
          </h1>
          <p className="text-blue-200 text-base sm:text-lg font-inter leading-7 max-w-xl">
            Become a member of the Southern University Alumni - Dallas Chapter
            and stay connected to the network that shaped you.
          </p>
        </div>
      </section>

      <main className="w-full bg-gray-50 py-12 px-6">
        <div className="max-w-screen-xl mx-auto flex flex-col gap-16">
          {/* Benefits Overview */}
          <section className="flex flex-col gap-8">
            <div className="text-center flex flex-col gap-2">
              <h2 className="text-blue-800 text-3xl font-semibold font-inter">
                Why Become a Member?
              </h2>
              <p className="text-gray-500 font-inter text-base max-w-xl mx-auto">
                Membership connects you to a thriving alumni community,
                meaningful causes, and a legacy that spans generations.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS_OVERVIEW.map((b, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    {b.icon}
                  </div>
                  <h3 className="text-blue-800 font-semibold font-inter text-base">
                    {b.title}
                  </h3>
                  <p className="text-gray-500 font-inter text-sm leading-6">
                    {b.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Join It Membership Widget */}
          <section className="flex flex-col gap-6">
            <div className="text-center flex flex-col gap-2">
              <h2 className="text-blue-800 text-3xl font-semibold font-inter">
                Become a Member
              </h2>
              <p className="text-gray-500 font-inter text-base max-w-xl mx-auto">
                Select a membership plan below and join the Southern University
                Alumni - Dallas Chapter today.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-black/10 p-6">
              <JoinItWidget />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};
