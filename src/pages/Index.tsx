import SiteHeader from "@/components/SiteHeader";
import HeroSlider from "@/components/HeroSlider";
import ClientsCarousel from "@/components/ClientsCarousel";
import CategoriesSection from "@/components/CategoriesSection";
import CustomTextiles from "@/components/CustomTextiles";
import SuggestionsSection from "@/components/SuggestionsSection";
import BlogSection from "@/components/BlogSection";
import MembershipSection from "@/components/MembershipSection";
import CertificationsSection from "@/components/CertificationsSection";
import SiteFooter from "@/components/SiteFooter";
import { usePageContent, usePageSections } from "@/hooks/useCms";
import { useLanguage } from "@/hooks/useLanguage";

const ALLOWED_SECTIONS = [
  "hero",
  "clients",
  "categories",
  "custom-textiles",
  "suggestions",
  "blog",
  "membership",
  "certifications",
];

const DEFAULT_ORDER = ALLOWED_SECTIONS;

function Index() {
  const { lang } = useLanguage();

  // Fetch content për gjuhën aktive — react-query cache-on automatikisht
  const { data: content } = usePageContent("home", lang);
  const { data: sections } = usePageSections("home");

  const orderedSectionKeys = sections
    ? sections
        .filter((s) => s.visible && ALLOWED_SECTIONS.includes(s.section_key))
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => s.section_key)
    : DEFAULT_ORDER;

  // Komponenti për çdo seksion — content është gjithmonë i fresh nga hook
  const sectionComponents: Record<string, JSX.Element> = {
    hero:              <HeroSlider content={content} />,
    clients:           <ClientsCarousel content={content} />,
    categories:        <CategoriesSection content={content} />,
    "custom-textiles": <CustomTextiles content={content} />,
    suggestions:       <SuggestionsSection content={content} />,
    blog:              <BlogSection content={content} />,
    membership:        <MembershipSection content={content} />,
    certifications:    <CertificationsSection content={content} />,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      {orderedSectionKeys.map((key) => {
        const comp = sectionComponents[key];
        if (!comp) return null;
        return <div key={key}>{comp}</div>;
      })}
      <SiteFooter />
    </div>
  );
}

export default Index;
