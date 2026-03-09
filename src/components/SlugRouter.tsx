import { useParams } from "react-router-dom";
import { usePageSlugs, resolveSlug } from "@/hooks/usePageSlugs";
import NotFound from "@/pages/NotFound";
import { useLanguage } from "@/hooks/useLanguage";

// Page components
import Company from "@/pages/Company";
import Clients from "@/pages/Clients";
import TailorMade from "@/pages/TailorMade";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
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
  shipping: Shipping,
  "payment-terms": PaymentTerms,
  "terms-of-use": TermsOfUse,
  "privacy-policy": PrivacyPolicy,
  register: Register,
  login: Login,
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

  const pageKey = resolveSlug(slugs, slug);
  
  if (!pageKey) {
    return <NotFound />;
  }

  const PageComponent = pageComponents[pageKey];
  if (!PageComponent) return <NotFound />;

  return <PageComponent />;
};

export default SlugRouter;
