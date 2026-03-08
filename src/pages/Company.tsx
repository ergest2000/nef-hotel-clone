import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Globe, Hotel, Handshake } from "lucide-react";

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
          <img
            src={image}
            alt={title}
            className="w-full h-[300px] md:h-[400px] object-cover"
            loading="lazy"
          />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-light tracking-brand text-foreground mb-6">
            {title}
          </h2>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            {text}
          </p>
        </div>
      </div>
    </div>
  </section>
);

const stats = [
  { icon: Globe, value: "12", label: "Countries" },
  { icon: Hotel, value: "1500+", label: "Hotels" },
  { icon: Handshake, value: "∞", label: "International Cooperation" },
];

const Company = () => {
  return (
    <div className="min-h-screen bg-background md:overflow-visible md:h-auto overflow-y-auto h-screen overscroll-none">
      <SiteHeader />

      {/* Hero */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img src={heroImg} alt="Our Company" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/50" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-brand text-white mb-4">
              Our Company
            </h1>
            <p className="text-sm md:text-base tracking-brand text-white/80 max-w-xl mx-auto uppercase">
              Premium hotel textiles crafted with passion and precision
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy - image right */}
      <AlternatingSection
        title="Our Philosophy"
        text="The production of high aesthetic and quality products made specifically for professional use, with the criterion of meeting the modern needs of high demands."
        image={philosophyImg}
      />

      {/* Divider */}
      <div className="container"><div className="border-t border-border" /></div>

      {/* Values - image left */}
      <AlternatingSection
        title="Our Values"
        text="Ethics, consistency and reliability have always been the fundamental values of our business."
        image={valuesImg}
        imageLeft
      />

      <div className="container"><div className="border-t border-border" /></div>

      {/* Research - image right */}
      <AlternatingSection
        title="Our Research"
        text="The research and development department is constantly alert for new raw materials and edits with criterion always the environment and human."
        image={researchImg}
      />

      <div className="container"><div className="border-t border-border" /></div>

      {/* Raw Materials - image left */}
      <AlternatingSection
        title="Our Raw Materials"
        text="We choose long cottons and state-of-the-art dyes, for production of high strength products."
        image={materialsImg}
        imageLeft
      />

      <div className="container"><div className="border-t border-border" /></div>

      {/* Equipment - image right */}
      <AlternatingSection
        title="Our Equipment"
        text="The continuous renewal of the technological and of our electronic equipment guarantees immediate dealing with every technical challenge and the production of any specialized product."
        image={equipmentImg}
      />

      <div className="container"><div className="border-t border-border" /></div>

      {/* Flexibility - image left */}
      <AlternatingSection
        title="Our Flexibility"
        text="We have the ability to manufacture products based on specific customer specifications, while maintaining the best combination of quality and price."
        image={flexibilityImg}
        imageLeft
      />

      {/* Network / Stats */}
      <section className="py-16 md:py-24 bg-warm-gray text-foreground">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-light tracking-brand mb-4">
            Our Network
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Confidence in our product results today in exports to 12 countries, as well as active cooperation with more than 1500 accommodation units in Greece.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-3">
                <stat.icon size={36} className="text-primary" />
                <span className="text-4xl md:text-5xl font-light tracking-brand text-foreground">{stat.value}</span>
                <span className="text-xs tracking-brand uppercase text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Company;
