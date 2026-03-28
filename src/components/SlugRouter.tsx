import { useParams } from "react-router-dom";
import { usePageSlugs, resolveSlug } from "@/hooks/usePageSlugs";
import NotFound from "@/pages/NotFound";


// Page components
import Company from "@/pages/Company";
import Clients from "@/pages/Clients";
import TailorMade from "@/pages/TailorMade";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import Certifications from "@/pages/Certifications";
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
  shipping: Shipping,
  "payment-terms": PaymentTerms,
  "terms-of-use": TermsOfUse,
  "privacy-policy": PrivacyPolicy,
  register: Register,
  login: Login,
};

// Hardcoded fallback slugs — if DB has no entry, these still work
const fallbackSlugs: Record<string, string> = {
  "company": "company",
  "kompania": "company",
  "rreth-nesh": "company",
  "about-us": "company",
  "clients": "clients",
  "klientet": "clients",
  "tailor-made": "tailor-made",
  "tekstile-te-personalizuara": "tailor-made",
  "contact": "contact",
  "kontakt": "contact",
  "certifications": "certifications",
  "certifikimet": "certifications",
  "blog": "blog",
  "shipping": "shipping",
  "transporti": "shipping",
  "payment-terms": "payment-terms",
  "kushtet-e-pageses": "payment-terms",
  "terms-of-use": "terms-of-use",
  "kushtet-e-perdorimit": "terms-of-use",
  "privacy-policy": "privacy-policy",
  "politika-e-privatesise": "privacy-policy",
  "register": "register",
  "regjistrohu": "register",
  "login": "login",
  "hyrje": "login",
};

const SlugRouter = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: slugs, isLoading } = usePageSlugs();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!slug) return null;

  // 1. Try DB slugs first
  let pageKey = resolveSlug(slugs, slug);

  // 2. Fallback to hardcoded map
  if (!pageKey) {
    pageKey = fallbackSlugs[slug.toLowerCase()] ?? null;
  }

  if (!pageKey) {
    return <NotFound />;
  }

  const PageComponent = pageComponents[pageKey];
  if (!PageComponent) return <NotFound />;

  return <PageComponent />;
};

export default SlugRouter;
