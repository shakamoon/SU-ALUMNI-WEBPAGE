import { useAuth } from "@animaapp/playground-react-sdk";
import { NavItem } from "@/sections/Header/components/NavItem";

type HeaderNavProps = {
  activePage?: "home" | "events" | "donations" | "about" | "membership";
  mobile?: boolean;
  onClose?: () => void;
};

export const HeaderNav = ({
  activePage = "home",
  mobile = false,
  onClose,
}: HeaderNavProps) => {
  const { isAnonymous, login, logout, isPending } = useAuth();

  const items = [
    { variant: "home" as const, label: "Home", href: "/" },
    {
      variant: "events" as const,
      label: "Events",
      href: "/events",
      iconSrc:
        "https://c.animaapp.com/mn1akxqgCOQKlW/assets/a688cb84a10535ef0245fed34595ff32f320dcb6.svg",
    },
    {
      variant: "membership" as const,
      label: "Membership",
      href: "/membership",
      iconSrc:
        "https://c.animaapp.com/mn1akxqgCOQKlW/assets/162dc9ac6fbd439bcb7d5f7237ad47ba0937b8d5.svg",
    },
    {
      variant: "donations" as const,
      label: "Donations",
      href: "https://giv.li/pyn4on",
      iconSrc:
        "https://c.animaapp.com/mn1akxqgCOQKlW/assets/ba5a95f7e28b234687b33f776467f83e1d12b62f.svg",
    },
    {
      variant: "about" as const,
      label: "About",
      href: "/about",
      iconSrc:
        "https://c.animaapp.com/mn1akxqgCOQKlW/assets/162dc9ac6fbd439bcb7d5f7237ad47ba0937b8d5.svg",
    },
  ];

  const handleAuthAction = async () => {
    if (isPending) return;
    if (isAnonymous) {
      await login();
    } else {
      await logout();
    }
    onClose?.();
  };

  if (mobile) {
    return (
      <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
        {items.map((item) => (
          <NavItem
            key={item.variant}
            {...item}
            active={activePage === item.variant}
            mobile
            onClick={onClose}
          />
        ))}

        {!isAnonymous && (
          <a
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-inter text-white hover:bg-white/10 transition-colors w-full"
          >
            Admin Panel
          </a>
        )}

        <button
          type="button"
          onClick={handleAuthAction}
          disabled={isPending}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-inter text-white hover:bg-white/10 transition-colors w-full text-left disabled:opacity-60"
        >
          {isPending ? "Loading..." : isAnonymous ? "Admin Login" : "Logout"}
        </button>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-1" aria-label="Main navigation">
      {items.map((item) => (
        <NavItem
          key={item.variant}
          {...item}
          active={activePage === item.variant}
        />
      ))}

      {!isAnonymous && (
        <a
          href="/admin"
          className="flex items-center gap-2 px-4 h-10 rounded-[10px] text-sm font-inter transition-colors text-white hover:bg-white/10"
        >
          Admin Panel
        </a>
      )}

      <button
        type="button"
        onClick={handleAuthAction}
        disabled={isPending}
        className="flex items-center gap-2 px-4 h-10 rounded-[10px] text-sm font-inter transition-colors text-white hover:bg-white/10 disabled:opacity-60"
      >
        {isPending ? "Loading..." : isAnonymous ? "Login" : "Logout"}
      </button>
    </nav>
  );
};
