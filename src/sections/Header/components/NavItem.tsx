export type NavItemProps = {
  variant: "home" | "events" | "donations" | "about" | "membership";
  label: string;
  href: string;
  iconSrc?: string;
  active?: boolean;
  mobile?: boolean;
  onClick?: () => void;
};

export const NavItem = (props: NavItemProps) => {
  const isActive = props.active ?? props.variant === "home";

  if (props.mobile) {
    return (
      <a
        href={props.href}
        onClick={props.onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-inter transition-colors w-full ${
          isActive
            ? "bg-amber-400 text-blue-800 font-medium"
            : "text-white hover:bg-white/10"
        }`}
      >
        {props.iconSrc && (
          <img src={props.iconSrc} alt="" className="w-5 h-5 shrink-0" />
        )}
        <span className={isActive ? "underline" : ""}>{props.label}</span>
      </a>
    );
  }

  return (
    <a
      href={props.href}
      className={`flex items-center gap-2 px-4 h-10 rounded-[10px] text-sm font-inter transition-colors ${
        isActive
          ? "bg-amber-400 text-blue-800 font-medium hover:bg-amber-300"
          : "text-white hover:bg-white/10"
      }`}
    >
      {props.iconSrc && (
        <img src={props.iconSrc} alt="" className="w-4 h-4 shrink-0" />
      )}
      <span className={isActive ? "underline" : ""}>{props.label}</span>
    </a>
  );
};
