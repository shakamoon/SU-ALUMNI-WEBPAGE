import { usePageMeta } from "@/hooks/usePageMeta";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";

export const AboutPage = () => {
  usePageMeta({
    title: "About",
    description:
      "Learn the history, leadership, scholarships, and governing bylaws of the Southern University Alumni - Dallas Chapter.",
    ogUrl: "https://suafdfw.org/about",
    canonical: "https://suafdfw.org/about",
  });

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white font-inter">
      <Header activePage="about" />
      <main className="w-full bg-white flex flex-col items-center justify-center py-20 px-4">
        <img
          src="https://c.animaapp.com/mn1akxqgCOQKlW/img/uploaded-asset-1774330076151-0.png"
          alt="SUAF Dallas Chapter early members – historic group photo"
          className="w-full max-w-xl object-contain rounded-lg shadow-md mt-10"
        />
        <p className="mt-4 text-gray-600 text-sm tracking-wide italic">
          Founded – April 10, 1955
        </p>

        <div className="mt-12 w-full max-w-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center tracking-wide">
            Founding Officers
          </h2>
          <ul className="space-y-2">
            {[
              { title: "President", name: "Joseph Lewis" },
              { title: "Vice President", name: "Judson Mechack" },
              { title: "Treasurer", name: "Emmit Conrad" },
              { title: "Secretary", name: "Mary Henry" },
              { title: "Financial Secretary", name: "Abner Coit" },
            ].map(({ title, name }) => (
              <li key={title} className="flex items-center gap-2 text-gray-700">
                <span className="text-gray-400">★</span>
                <span className="font-medium">{name}</span>
                <span className="text-gray-400">–</span>
                <span className="text-gray-500">{title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 w-full max-w-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center tracking-wide">
            Founding Members
          </h2>
          <ul className="space-y-2">
            {[
              { name: "Walter Berry", deceased: true },
              { name: "Lila Bradley", deceased: true },
              { name: "Vasti Bradley", deceased: true },
              { name: "Marion Henry", deceased: true },
              { name: "Joseph Lockridge", deceased: true },
              { name: "Dorothy Meshack", deceased: true },
              { name: "Elston Miles", deceased: true },
              { name: "Ballard Mitchell", deceased: true },
              { name: "Althea Simmons", deceased: true },
              { name: "Betty Tanner", deceased: false },
              { name: "Clyde Williams", deceased: true },
            ].map(({ name, deceased }) => (
              <li key={name} className="flex items-center gap-2 text-gray-700">
                {deceased ? (
                  <span className="text-gray-400">★</span>
                ) : (
                  <span className="w-4 inline-block" />
                )}
                <span className="font-medium">{name}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-400 italic">★ Deceased</p>
        </div>

        <div className="mt-12 w-full max-w-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-1 text-center tracking-wide">
            Current Officers
          </h2>
          <p className="text-center text-sm text-gray-500 mb-4 tracking-wide">
            2024 – 2026
          </p>
          <ul className="space-y-2">
            {[
              { title: "President", name: "Brandy Tyson" },
              { title: "1st Vice President", name: "Felicia N. Lockridge" },
              { title: "2nd Vice President", name: "Samara Samuel" },
              { title: "3rd Vice President", name: "Natalie Hambelton" },
              { title: "Treasurer", name: "Gregory Franklin" },
              { title: "Recording Secretary", name: "ShaCrista Rideaux" },
              { title: "Parliamentarian", name: "Tremea Price" },
              { title: "Sergeant-at-Arms", name: "DeeDee Roquemore" },
              { title: "Chaplain", name: "Oshay Hayes" },
              { title: "Historian", name: "Leon Baylor" },
            ].map(({ title, name }) => (
              <li key={title} className="flex items-center gap-2 text-gray-700">
                <span className="w-4 inline-block text-center text-blue-400">
                  •
                </span>
                <span className="font-medium">{name}</span>
                <span className="text-gray-400">–</span>
                <span className="text-gray-500">{title}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Scholarship Information */}
        <div className="mt-16 w-full max-w-2xl">
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-8 py-12 flex flex-col items-center text-center shadow-sm">
            <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              Scholarship Information
            </h2>
            <p className="text-gray-600 text-base max-w-lg mb-6 leading-relaxed">
              The scholarships are awarded on a semesterly basis, and are
              evaluated according to academic achievement, educational
              objectives, and career aspirations. Award amounts vary and may be
              used for tuition and fees, room and board, books and supplies, or
              other educational expenses.
            </p>
            <div className="flex flex-col items-center gap-1 bg-white rounded-xl px-6 py-4 border border-yellow-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">
                For more information, contact us at
              </p>
              <a
                href="mailto:suafdallas@yahoo.com"
                className="text-blue-600 hover:text-blue-800 font-semibold text-lg transition-colors duration-200"
              >
                suafdallas@yahoo.com
              </a>
            </div>
          </div>
        </div>

        {/* SU Links */}
        <div className="mt-16 w-full max-w-2xl">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-8 py-10 flex flex-col items-center text-center shadow-sm">
            <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              SU Links
            </h2>
            <p className="text-gray-500 text-base max-w-md mb-8">
              Official Southern University System resources, campuses,
              athletics, and affiliated organizations.
            </p>
            <ul className="w-full max-w-md space-y-3 text-left">
              {[
                {
                  label: "Southern University System",
                  href: "http://www.sus.edu",
                },
                {
                  label: "Southern University Alumni Federation",
                  href: "http://www.sualumni.org",
                },
                {
                  label: "Southern University and A&M College",
                  href: "http://www.subr.edu",
                },
                {
                  label: "SU Agricultural Research and Extension Center",
                  href: "http://www.suagcenter.com",
                },
                {
                  label: "Southern University at New Orleans",
                  href: "http://www.suno.edu",
                },
                {
                  label: "Southern University at Shreveport Louisiana",
                  href: "http://www.susla.edu",
                },
                {
                  label: "Southern University Law Center",
                  href: "http://www.sulc.edu",
                },
                {
                  label: "Southern Digest",
                  href: "http://www.southerndigest.com",
                },
                {
                  label: "SU and A&M College Athletics",
                  href: "http://www.jagsports.com",
                },
                {
                  label: "Southwestern Athletic Conference",
                  href: "http://www.swac.org",
                },
              ].map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group bg-white rounded-xl px-4 py-3 border border-blue-100 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200"
                  >
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-500 transition-colors duration-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3 text-blue-500 group-hover:text-white transition-colors duration-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </span>
                    <span className="text-gray-700 group-hover:text-blue-700 font-medium text-sm transition-colors duration-200">
                      {label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Constitution & Bylaws */}
        <div className="mt-16 w-full max-w-2xl">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-8 py-12 flex flex-col items-center text-center shadow-sm">
            <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              Chapter Constitution
              <br />
              And Bylaws
            </h2>
            <p className="text-gray-500 text-base max-w-md mb-8">
              The governing rules and procedures of the Southern University
              Alumni - Dallas Chapter, including membership rights, officer
              duties, and chapter governance.
            </p>
            <a
              href="https://suafdallas.org/wp-content/uploads/2024/02/SUAF-Dallas-Constitution-and-By-Laws_Amended_04152023.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-full transition-colors duration-200 text-sm tracking-wide"
            >
              Read the Full Document
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
