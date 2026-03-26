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

var allowedSections = ["hero", "clients", "categories", "custom-textiles", "suggestions", "blog", "membership", "certifications"];

function Index() {
  var langHook = useLanguage();
  var lang = langHook.lang;
  var contentData = usePageContent("home", lang);
  var content = contentData.data;
  var sectionsData = usePageSections("home");
  var sections = sectionsData.data;

  var orderedSectionKeys = sections
    ? sections
        .filter(function (s) { return s.visible && allowedSections.includes(s.section_key); })
        .sort(function (a, b) { return a.sort_order - b.sort_order; })
        .map(function (s) { return s.section_key; })
    : ["hero", "clients", "categories", "custom-textiles", "suggestions", "blog", "membership", "certifications"];

  var sectionComponents: Record<string, JSX.Element> = {
    hero: <HeroSlider content={content} />,
    clients: <ClientsCarousel content={content} />,
    categories: <CategoriesSection content={content} />,
    "custom-textiles": <CustomTextiles content={content} />,
    suggestions: <SuggestionsSection content={content} />,
    blog: <BlogSection content={content} />,
    membership: <MembershipSection content={content} />,
    certifications: <CertificationsSection content={content} />,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      {orderedSectionKeys.map(function (key) {
        var comp = sectionComponents[key];
        if (!comp) return null;
        return <div key={key}>{comp}</div>;
      })}
      <SiteFooter />
    </div>
  );
}

export default Index;
