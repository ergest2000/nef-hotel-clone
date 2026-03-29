import { useParams, Navigate } from "react-router-dom";
import { usePageSlugs, resolveSlug } from "@/hooks/usePageSlugs";
import { useLanguage } from "@/hooks/useLanguage";
import NotFound from "@/pages/NotFound";


// Page components
import Company from "@/pages/Company";
import Clients from "@/pages/Clients";
import TailorMade from "@/pages/TailorMade";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import Certifications from "@/pages/Certifications";
import Catalogue from "@/pages/Catalogue";
import Shipping from "@/pages/Shipping";
import PaymentTerms from "@/pages/PaymentTerms";
import TermsOfUse from "@/pages/TermsOfUse";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Register from "@/pages/Register";
import Login from "@/pages/Login";

const pageComponents: Record<string, React.ComponentType> = {
  company: Company,
  clients: Clients,
  "tailor-made": TailorMade,
  contact: Contact,
  blog: Blog,
  certifications: Certifications,
  catalogue: Catalogue,
  shipping: Shipping,
  "payment-terms": PaymentTerms,
  "terms-of-use": TermsOfUse,
  "privacy-policy": PrivacyPolicy,
  register: Register,
  login: Login,
};

// Hardcoded fallback slugs — if DB has no entry, these still work
// Also serves as redirect map for old/alternative slugs
const fallbackSlugs: Record<string, string> = {
  "company": "company",
  "kompania": "company",
  "rreth-nesh": "company",
  "about-us": "company",
  "about": "company",
  "clients": "clients",
  "klientet": "clients",
  "klientët": "clients",
  "tailor-made": "tailor-made",
  "tekstile-te-personalizuara": "tailor-made",
  "tekstile-të-personalizuara": "tailor-made",
  "contact": "contact",
  "kontakt": "contact",
  "kontakti": "contact",
  "certifications": "certifications",
  "certifikimet": "certifications",
  "catalogue": "catalogue",
  "katalogu": "catalogue",
  "katalog": "catalogue",
  "blog": "blog",
  "shipping": "shipping",
  "transporti": "shipping",
  "dërgesa": "shipping",
  "payment-terms": "payment-terms",
  "kushtet-e-pageses": "payment-terms",
  "kushtet-e-pagesës": "payment-terms",
  "terms-of-use": "terms-of-use",
  "kushtet-e-perdorimit": "terms-of-use",
  "kushtet-e-përdorimit": "terms-of-use",
  "privacy-policy": "privacy-policy",
  "politika-e-privatesise": "privacy-policy",
  "politika-e-privatësisë": "privacy-policy",
  "register": "register",
  "regjistrohu": "register",
  "login": "login",
  "hyrje": "login",
  "hyr": "login",
};

const SlugRouter = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: slugs, isLoading } = usePageSlugs();
  const { lang } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!slug) return null;

  var lowerSlug = slug.toLowerCase();

  // 1. Try DB slugs first — exact match
  var pageKey = resolveSlug(slugs, lowerSlug);

  // 2. Fallback to hardcoded map
  if (!pageKey) {
    pageKey = fallbackSlugs[lowerSlug] ?? null;
  }

  if (!pageKey) {
    return <NotFound />;
  }

  // 3. Check if the current URL slug is the canonical one for this language
  // If not, redirect to the canonical slug (301-style)
  if (slugs) {
    var slugEntry = slugs.find(function (s) { return s.page_key === pageKey; });
    if (slugEntry) {
      var canonicalSlug = lang === "al" ? slugEntry.slug_al : slugEntry.slug_en;
      if (canonicalSlug && canonicalSlug !== lowerSlug) {
        return <Navigate to={"/" + canonicalSlug} replace />;
      }
    }
  }

  const PageComponent = pageComponents[pageKey];
  if (!PageComponent) return <NotFound />;

  return <PageComponent />;
};

export default SlugRouter;
