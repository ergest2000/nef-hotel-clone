import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CategoriesSection from "@/components/CategoriesSection";
import ClientsCarousel from "@/components/ClientsCarousel";
import CertificationsSection from "@/components/CertificationsSection";
import { usePageContent, usePageSections, getContentValue } from "@/hooks/useCms";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import heroImg from "@/assets/company-hero.jpg";
import philosophyImg from "@/assets/company-philosophy.jpg";
import valuesImg from "@/assets/company-values.jpg";
import researchImg from "@/assets/company-research.jpg";
import materialsImg from "@/assets/company-materials.jpg";
import equipmentImg from "@/assets/company-equipment.jpg";
import flexibilityImg from "@/assets/company-flexibility.jpg";

/* ── Alternating text+image section ────────────────────────────── */
const AlternatingSection = ({
  title,
  text,
  image,
  imageLeft = false,
}: {
  title: string;
  text: string;
  image: string;
  imageLeft?: boolean;
}) => (
  <section className="py-16 md:py-24">
    <div className="container">
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center ${
          imageLeft ? "" : "md:[&>*:first-child]:order-2"
        }`}
      >
        <div className="overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-[300px] md:h-[420px] object-cover"
            loading="lazy"
          />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-light tracking-brand text-foreground mb-6">
            {title}
          </h2>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base whitespace-pre-wrap">
            {text}
          </p>
        </div>
      </div>
    </div>
  </section>
);

/* ── Main page ─────────────────────────────────────────────────── */
const Company = () => {
  const { lang, isAl } = useLanguage();
  const { data: content } = usePageContent("company", lang);
  const { data: homeContent } = usePageContent("home", lang);
  const { data: sections } = usePageSections("company");

  const t = (al: string, en: string) => (isAl ? al : en);

  const isSectionVisible = (key: string) => {
    if (!sections) return true;
    const s = sections.find((sec) => sec.section_key === key);
    return s ? s.visible : true;
  };

  const g = (sectionKey: string, fieldKey: string, fallback: string) =>
    getContentValue(content, sectionKey, fieldKey, fallback);

  const getImg = (sectionKey: string, fieldKey: string, fallback: string) => {
    const val = g(sectionKey, fieldKey, "");
    return val && !val.startsWith("/src/") ? val : fallback;
  };

  /* Content sections — all CMS-editable */
  const storySections = [
    {
      key: "philosophy",
      fallbackTitle: t("Filozofia Jonë", "Our Philosophy"),
      fallbackText: t(
        "Prodhimi i produkteve me estetikë dhe cilësi të lartë, të bëra posaçërisht për përdorim profesional, me kriterin e plotësimit të nevojave moderne.",
        "The production of high aesthetic and quality products made specifically for professional use, with the criterion of meeting the modern needs of high demands."
      ),
      fallbackImg: philosophyImg,
      imageLeft: false,
    },
    {
      key: "values",
      fallbackTitle: t("Vlerat Tona", "Our Values"),
      fallbackText: t(
        "Etika, qëndrueshmëria dhe besueshmëria kanë qenë gjithmonë vlerat themelore të biznesit tonë.",
        "Ethics, consistency and reliability have always been the fundamental values of our business."
      ),
      fallbackImg: valuesImg,
      imageLeft: true,
    },
    {
      key: "research",
      fallbackTitle: t("Kërkimi dhe Zhvillimi", "Our Research"),
      fallbackText: t(
        "Departamenti i kërkimit dhe zhvillimit është gjithmonë në kërkim të lëndëve të para të reja, me kriter mjedisin dhe njeriun.",
        "The research and development department is constantly alert for new raw materials, with criterion always the environment and human."
      ),
      fallbackImg: researchImg,
      imageLeft: false,
    },
    {
      key: "materials",
      fallbackTitle: t("Lëndët e Para", "Our Raw Materials"),
      fallbackText: t(
        "Zgjedhim pambukë të gjatë dhe ngjyrosje të teknologjisë së fundit, për prodhimin e produkteve me rezistencë të lartë.",
        "We choose long cottons and state-of-the-art dyes, for production of high strength products."
      ),
      fallbackImg: materialsImg,
      imageLeft: true,
    },
    {
      key: "equipment",
      fallbackTitle: t("Pajisjet Tona", "Our Equipment"),
      fallbackText: t(
        "Rinovimi i vazhdueshëm i pajisjeve teknologjike garanton trajtimin e menjëhershëm të çdo sfide teknike.",
        "The continuous renewal of our technological equipment guarantees immediate dealing with every technical challenge."
      ),
      fallbackImg: equipmentImg,
      imageLeft: false,
    },
    {
      key: "flexibility",
      fallbackTitle: t("Fleksibiliteti Ynë", "Our Flexibility"),
      fallbackText: t(
        "Kemi aftësinë të prodhojmë produkte bazuar në specifikimet e klientit, duke ruajtur kombinimin më të mirë të cilësisë dhe çmimit.",
        "We have the ability to manufacture products based on specific customer specifications, while maintaining the best combination of quality and price."
      ),
      fallbackImg: flexibilityImg,
      imageLeft: true,
    },
  ];

  /* Stats */
  const stats = [
    {
      valueKey: "stat1_value",
      labelKey: "stat1_label",
      fallbackValue: "50+",
      fallbackLabel: t("Vite Eksperiencë", "Years of Experience"),
    },
    {
      valueKey: "stat2_value",
      labelKey: "stat2_label",
      fallbackValue: "1500+",
      fallbackLabel: t("Klientë", "Clients"),
    },
    {
      valueKey: "stat3_value",
      labelKey: "stat3_label",
      fallbackValue: "500+",
      fallbackLabel: t("Produkte", "Products"),
    },
    {
      valueKey: "stat4_value",
      labelKey: "stat4_label",
      fallbackValue: "12+",
      fallbackLabel: t("Vende", "Countries"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ─── 1. Hero Section ─────────────────────────────────────── */}
      {isSectionVisible("hero") && (
        <section className="relative h-[50vh] md:h-[65vh] overflow-hidden">
          <img
            src={getImg("hero", "image", heroImg)}
            alt="Company"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/50" />
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-brand text-white mb-5">
                {g("hero", "title", t("Rreth Nesh", "About Us"))}
              </h1>
              <p className="text-sm md:text-base tracking-wide text-white/80 max-w-xl mx-auto leading-relaxed">
                {g(
                  "hero",
                  "subtitle",
                  t(
                    "Tekstile premium hotelerie, të punuara me pasion dhe precizion.",
                    "Premium hotel textiles crafted with passion and precision."
                  )
                )}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ─── 2. Story sections (alternating text + image) ─────── */}
      {storySections.map((sec, i) =>
        isSectionVisible(sec.key) ? (
          <div key={sec.key}>
            {i > 0 && (
              <div className="container">
                <div className="border-t border-border" />
              </div>
            )}
            <AlternatingSection
              title={g(sec.key, "title", sec.fallbackTitle)}
              text={g(sec.key, "text", sec.fallbackText)}
              image={getImg(sec.key, "image", sec.fallbackImg)}
              imageLeft={sec.imageLeft}
            />
          </div>
        ) : null
      )}

      {/* ─── 3. Statistics / Highlights ──────────────────────────── */}
      {isSectionVisible("network") && (
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-2xl md:text-3xl font-light tracking-brand mb-4">
              {g("network", "title", t("Rrjeti Ynë", "Our Network"))}
            </h2>
            <p className="text-sm md:text-base opacity-80 max-w-2xl mx-auto mb-14 leading-relaxed">
              {g(
                "network",
                "text",
                t(
                  "Besimi në produktin tonë rezulton sot në eksporte në mbi 12 vende, si dhe bashkëpunim aktiv me mbi 1500 njësi akomodimi.",
                  "Confidence in our product results today in exports to 12 countries, as well as active cooperation with more than 1500 accommodation units."
                )
              )}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.labelKey} className="flex flex-col items-center gap-2">
                  <span className="text-4xl md:text-5xl font-light tracking-brand">
                    {g("network", stat.valueKey, stat.fallbackValue)}
                  </span>
                  <span className="text-xs tracking-wide uppercase opacity-70">
                    {g("network", stat.labelKey, stat.fallbackLabel)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 4. Categories ───────────────────────────────────────── */}
      {isSectionVisible("categories") && (
        <CategoriesSection content={homeContent} />
      )}

      {/* ─── 5. Brands / Clients carousel ────────────────────────── */}
      {isSectionVisible("clients") && (
        <ClientsCarousel content={homeContent} />
      )}

      {/* ─── 6. Certifications ───────────────────────────────────── */}
      {isSectionVisible("certifications") && (
        <CertificationsSection content={homeContent} />
      )}

      {/* ─── 7. Call To Action ───────────────────────────────────── */}
      {isSectionVisible("cta") && (
        <section className="py-16 md:py-24 border-t border-border">
          <div className="container text-center">
            <h2 className="text-2xl md:text-3xl font-light tracking-brand text-foreground mb-4">
              {g(
                "cta",
                "title",
                t("Na Kontaktoni për Ofertë", "Contact Us for a Quote")
              )}
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
              {g(
                "cta",
                "text",
                t(
                  "Jemi të gatshëm t'ju ndihmojmë me zgjidhje të personalizuara për biznesin tuaj.",
                  "We are ready to help you with customized solutions for your business."
                )
              )}
            </p>
            <Link
              to="/checkout"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-xs tracking-wider uppercase text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#163058" }}
            >
              {g(
                "cta",
                "button",
                t("KËRKO NJË OFERTË", "REQUEST A QUOTE")
              )}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
};

export default Company;
