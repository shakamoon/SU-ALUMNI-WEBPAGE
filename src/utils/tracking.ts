const DONATION_URL = "https://giv.li/pyn4on";

/** Fire a GA4 event (no-op if gtag isn't loaded) */
function gtagEvent(name: string, params: Record<string, string>) {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", name, params);
  }
}

/**
 * Track a donation CTA click then open the donation platform in a new tab.
 * @param source  human-readable label for where the click originated
 */
export function openDonation(source: string): void {
  gtagEvent("donation_cta_click", {
    event_category: "engagement",
    event_label: source,
    donation_url: DONATION_URL,
  });
  window.open(DONATION_URL, "_blank", "noopener,noreferrer");
}

export { DONATION_URL };
