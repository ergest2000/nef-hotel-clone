import SiteHeader from "@/components/SiteHeader";
import HeroSlider from "@/components/HeroSlider";
import ClientsCarousel from "@/components/ClientsCarousel";
import CategoriesSection from "@/components/CategoriesSection";
import CustomTextiles from "@/components/CustomTextiles";
import SuggestionsSection from "@/components/SuggestionsSection";
import NewsletterSection from "@/components/NewsletterSection";
import BlogSection from "@/components/BlogSection";
import MembershipSection from "@/components/MembershipSection";
import CertificationsSection from "@/components/CertificationsSection";
import SiteFooter from "@/components/SiteFooter";
import { usePageContent, usePageSections, getContentValue } from "@/hooks/useCms";

const Index = () => {
  const { data: content } = usePageContent("home", "al");
  const { data: sections } = usePageSections("home");

  // Helper to check if a section is visible
  const isSectionVisible = (sectionKey: string) => {
    if (!sections) return true;
    const section = sections.find((s) => s.section_key === sectionKey);
    return section ? section.visible : true;
  };

  // Get sections sorted by sort_order for rendering order
  const orderedSectionKeys = sections
    ? sections
        .filter((s) => s.visible)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => s.section_key)
    : ["hero", "clients", "categories", "custom-textiles", "suggestions", "blog", "membership", "certifications", "newsletter"];

  const sectionComponents: Record<string, JSX.Element> = {
    hero: <HeroSlider content={content} />,
    clients: <ClientsCarousel content={content} />,
    categories: <CategoriesSection content={content} />,
    "custom-textiles": <CustomTextiles content={content} />,
    suggestions: <SuggestionsSection content={content} />,
    blog: <BlogSection content={content} />,
    membership: <MembershipSection content={content} />,
    certifications: <CertificationsSection content={content} />,
    newsletter: <NewsletterSection content={content} />,
  };

  return (
    <div className="min-h-screen bg-background md:overflow-visible md:h-auto overflow-y-auto overflow-x-hidden h-screen overscroll-none">
      <SiteHeader />
      {orderedSectionKeys.map((key) =>
        sectionComponents[key] ? (
          <div key={key}>{sectionComponents[key]}</div>
        ) : null
      )}
      <SiteFooter />
    </div>
  );
};

export default Index;
