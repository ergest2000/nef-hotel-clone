import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useStaticPage } from "@/hooks/useStaticPages";
import { useLanguage } from "@/hooks/useLanguage";

const TermsOfUse = () => {
  const { lang } = useLanguage();
  const { data: page } = useStaticPage("terms-of-use");
  const title = lang === "en" ? (page?.title_en || "TERMS OF USE") : (page?.title_al || "TERMS OF USE");
  const content = lang === "en" ? (page?.content_en || "") : (page?.content_al || "");

  return (
    <div className="min-h-screen bg-background flex flex-col md:overflow-visible md:h-auto overflow-y-auto h-screen overscroll-none">
      <SiteHeader />
      <section className="py-16 md:py-24 flex-1">
        <div className="container max-w-3xl">
          <h1 className="text-2xl md:text-4xl tracking-wide-brand text-foreground font-light mb-10">{title}</h1>
          <div className="prose prose-sm md:prose-base text-muted-foreground max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
};

export default TermsOfUse;
