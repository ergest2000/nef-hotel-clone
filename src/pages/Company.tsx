import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Globe, Hotel, Handshake } from "lucide-react";
import { usePageContent, usePageSections, getContentValue } from "@/hooks/useCms";
import { useLanguage } from "@/hooks/useLanguage";

import heroImg from "@/assets/company-hero.jpg";
import philosophyImg from "@/assets/company-philosophy.jpg";
import valuesImg from "@/assets/company-values.jpg";
import researchImg from "@/assets/company-research.jpg";
import materialsImg from "@/assets/company-materials.jpg";
import equipmentImg from "@/assets/company-equipment.jpg";
import flexibilityImg from "@/assets/company-flexibility.jpg";

interface SectionProps {
  title: string;
  text: string;
  image: string;
  imageLeft?: boolean;
}

const AlternatingSection = ({ title, text, image, imageLeft = false }: SectionProps) => (
  <section className="py-16 md:py-24">
    <div className="container">
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center ${imageLeft ? "" : "md:[&>*:first-child]:order-2"}`}>
        <div className="overflow-hidden">
          <img src={image} alt={title} className="w-full h-[300px] md:h-[400px] object-cover" loading="lazy" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-light tracking-brand text-foreground mb-6">{title}</h2>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{text}</p>
        </div>
      </div>
    </div>
  </section>
);

const Company = () => {
  const { lang } = useLanguage();
  const { data: content } = usePageContent("company", lang);
  const { data: sections } = usePageSections("company");

  const isSectionVisible = (key: string) => {
    if (!sections) return true;
    const s = sections.find((sec) => sec.section_key === key);
    return s ? s.visible : true;
  };

  const getImg = (sectionKey: string, fieldKey: string, fallback: string) => {
    const val = getContentValue(content, sectionKey, fieldKey, "");
    return val && !val.startsWith("/src/") ? val : fallback;
  };

  const companySections = [
    { key: "philosophy", fallbackTitle: "Our Philosophy", fallbackText: "The production of high aesthetic and quality products made specifically for professional use, with the criterion of meeting the modern needs of high demands.", fallbackImg: philosophyImg, imageLeft: false },
    { key: "values", fallbackTitle: "Our Values", fallbackText: "Ethics, consistency and reliability have always been the fundamental values of our business.", fallbackImg: valuesImg, imageLeft: true },
  ];

  const extraSections = [
    { key: "research", fallbackTitle: "Our Research", fallbackText: "The research and development department is constantly alert for new raw materials and edits with criterion always the environment and human.", fallbackImg: researchImg, imageLeft: false },
    { key: "materials", fallbackTitle: "Our Raw Materials", fallbackText: "We choose long cottons and state-of-the-art dyes, for production of high strength products.", fallbackImg: materialsImg, imageLeft: true },
    { key: "equipment", fallbackTitle: "Our Equipment", fallbackText: "The continuous renewal of the technological and of our electronic equipment guarantees immediate dealing with every technical challenge and the production of any specialized product.", fallbackImg: equipmentImg, imageLeft: false },
    { key: "flexibility", fallbackTitle: "Our Flexibility", fallbackText: "We have the ability to manufacture products based on specific customer specifications, while maintaining the best combination of quality and price.", fallbackImg: flexibilityImg, imageLeft: true },
  ];

  const stats = [
    { icon: Globe, valueKey: "stat1_value", labelKey: "stat1_label", fallbackValue: "12", fallbackLabel: "Countries" },
    { icon: Hotel, valueKey: "stat2_value", labelKey: "stat2_label", fallbackValue: "1500+", fallbackLabel: "Hotels" },
    { icon: Handshake, valueKey: "stat3_value", labelKey: "stat3_label", fallbackValue: "∞", fallbackLabel: "International Cooperation" },
  ];

  return (
    <div className="min-h-screen bg-background md:overflow-visible md:h-auto overflow-y-auto h-screen overscroll-none">
      <SiteHeader />

      {isSectionVisible("hero") && (
        <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <img src={getImg("hero", "image", heroImg)} alt="Our Company" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/50" />
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-brand text-white mb-4">
                {getContentValue(content, "hero", "title", "Our Company")}
              </h1>
              <p className="text-sm md:text-base tracking-brand text-white/80 max-w-xl mx-auto uppercase">
                {getContentValue(content, "hero", "subtitle", "Premium hotel textiles crafted with passion and precision")}
              </p>
            </div>
          </div>
        </section>
      )}

      {[...companySections, ...extraSections].map((sec, i) => (
        isSectionVisible(sec.key) && (
          <div key={sec.key}>
            {i > 0 && <div className="container"><div className="border-t border-border" /></div>}
            <AlternatingSection
              title={getContentValue(content, sec.key, "title", sec.fallbackTitle)}
              text={getContentValue(content, sec.key, "text", sec.fallbackText)}
              image={getImg(sec.key, "image", sec.fallbackImg)}
              imageLeft={sec.imageLeft}
            />
          </div>
        )
      ))}

      {isSectionVisible("network") && (
        <section className="py-16 md:py-24 bg-warm-gray text-foreground">
          <div className="container text-center">
            <h2 className="text-2xl md:text-3xl font-light tracking-brand mb-4">
              {getContentValue(content, "network", "title", "Our Network")}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              {getContentValue(content, "network", "text", "Confidence in our product results today in exports to 12 countries, as well as active cooperation with more than 1500 accommodation units in Greece.")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.labelKey} className="flex flex-col items-center gap-3">
                  <stat.icon size={36} className="text-primary" />
                  <span className="text-4xl md:text-5xl font-light tracking-brand text-foreground">
                    {getContentValue(content, "network", stat.valueKey, stat.fallbackValue)}
                  </span>
                  <span className="text-xs tracking-brand uppercase text-muted-foreground">
                    {getContentValue(content, "network", stat.labelKey, stat.fallbackLabel)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
};

export default Company;
