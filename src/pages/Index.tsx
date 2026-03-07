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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <HeroSlider />
      <ClientsCarousel />
      <CategoriesSection />
      <CustomTextiles />
      <SuggestionsSection />
      <NewsletterSection />
      <BlogSection />
      <MembershipSection />
      <CertificationsSection />
      <SiteFooter />
    </div>
  );
};

export default Index;
