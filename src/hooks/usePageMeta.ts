import { useEffect } from "react";

type PageMetaOptions = {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  canonical?: string;
  ogImage?: string;
};

const BASE_TITLE = "Southern University Alumni - Dallas Chapter";
const BASE_DESCRIPTION =
  "The Southern University Alumni - Dallas Chapter — connecting Jaguar alumni through scholarships, networking, community service, and events across the DFW area.";
const BASE_SITE_URL = "https://suafdfw.org";
const BASE_OG_IMAGE =
  "https://c.animaapp.com/mn1akxqgCOQKlW/img/uploaded-asset-1774329675127-0.png";

function setMeta(
  name: string,
  content: string,
  attr: "name" | "property" = "name",
) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function usePageMeta({
  title,
  description = BASE_DESCRIPTION,
  ogTitle,
  ogDescription,
  ogUrl,
  canonical,
  ogImage = BASE_OG_IMAGE,
}: PageMetaOptions) {
  useEffect(() => {
    const fullTitle = `${title} | ${BASE_TITLE}`;

    // Page <title>
    document.title = fullTitle;

    // Primary meta
    setMeta("description", description);

    const resolvedOgUrl = ogUrl ?? BASE_SITE_URL;
    const resolvedCanonical = canonical ?? resolvedOgUrl;

    // Open Graph
    setMeta("og:type", "website", "property");
    setMeta("og:site_name", BASE_TITLE, "property");
    setMeta("og:title", ogTitle ?? fullTitle, "property");
    setMeta("og:description", ogDescription ?? description, "property");
    setMeta("og:url", resolvedOgUrl, "property");
    setMeta("og:image", ogImage, "property");
    setMeta(
      "og:image:alt",
      "Southern University Alumni - Dallas Chapter official logo",
      "property",
    );

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", ogTitle ?? fullTitle);
    setMeta("twitter:description", ogDescription ?? description);
    setMeta("twitter:image", ogImage);

    // Canonical
    setLink("canonical", resolvedCanonical);

    // Restore base title on unmount
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, description, ogTitle, ogDescription, ogUrl, canonical, ogImage]);
}
