import { forwardRef } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { usePageSlugs, getSlugForPage } from "@/hooks/usePageSlugs";
import { useLanguage } from "@/hooks/useLanguage";

// Maps static paths to page_keys
const pathToPageKey: Record<string, string> = {
  "/company": "company",
  "/clients": "clients",
  "/tailor-made": "tailor-made",
  "/contact": "contact",
  "/blog": "blog",
  "/certifications": "certifications",
  "/shipping": "shipping",
  "/payment-terms": "payment-terms",
  "/terms-of-use": "terms-of-use",
  "/privacy-policy": "privacy-policy",
  "/register": "register",
  "/login": "login",
};

interface SlugLinkProps extends Omit<LinkProps, "to"> {
  to: string;
}

/** A Link that automatically resolves the href to the correct language slug */
const SlugLink = forwardRef<HTMLAnchorElement, SlugLinkProps>(({ to, ...props }, ref) => {
  const { data: slugs } = usePageSlugs();
  const { lang } = useLanguage();

  const resolvedTo = resolveHref(to, slugs, lang);
  return <Link {...props} to={resolvedTo} ref={ref} />;
});

export const resolveHref = (
  href: string,
  slugs: ReturnType<typeof usePageSlugs>["data"],
  lang: "al" | "en"
): string => {
  if (!slugs || !href.startsWith("/")) return href;
  
  // Check exact match first
  const pageKey = pathToPageKey[href];
  if (pageKey) {
    return "/" + getSlugForPage(slugs, pageKey, lang);
  }
  
  // Check if it starts with a known path (e.g. /blog/some-post)
  for (const [path, key] of Object.entries(pathToPageKey)) {
    if (href.startsWith(path + "/")) {
      const rest = href.slice(path.length);
      return "/" + getSlugForPage(slugs, key, lang) + rest;
    }
  }

  return href;
};

export default SlugLink;
