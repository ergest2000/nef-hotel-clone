import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CertificationsSection from "@/components/CertificationsSection";
import { usePageContent, getContentValue } from "@/hooks/useCms";
import { useLanguage } from "@/hooks/useLanguage";
import { useDesign } from "@/hooks/useDesignSettings";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { useManagedLogos } from "@/hooks/useManagedLogos";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import heroImg from "@/assets/company-hero.jpg";
import philosophyImg from "@/assets/company-philosophy.jpg";
import valuesImg from "@/assets/company-values.jpg";
import researchImg from "@/assets/company-research.jpg";

/* ─────────────────────────────────────────────────────────────────
   Premium Section Heading — unified style for entire page
   Thin uppercase text + centered hairline underneath
   ───────────────────────────────────────────────────────────────── */
const SectionHeading = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <div className="text-center mb-10 md:mb-14">
    <h2
      className={`text-xs md:text-sm tracking-[0.3em] uppercase font-medium ${
        light ? "text-white/90" : "text-foreground"
      }`}
    >
      {children}
    </h2>
    <div className={`w-8 h-px mx-auto mt-4 ${light ? "bg-white/30" : "bg-foreground/20"}`} />
  </div>
);

/* ── Image Carousel ────────────────────────────────────────────── */
const ImageCarousel = ({ images }: { images: string[] }) => {
  const [idx, setIdx] = useState(0);
  if (!images.length) return null;
  const prev = () => setIdx((i) => (i > 0 ? i - 1 : images.length - 1));
  const next = () => setIdx((i) => (i < images.length - 1 ? i + 1 : 0));

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <img
          src={images[idx]}
          alt=""
          className="w-full h-[300px] md:h-[450px] object-cover"
        />
      </div>
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-white/30 bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-white/30 bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </button>
          <div className="flex items-center justify-center gap-3 mt-6">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === idx
                    ? "w-6 h-1.5 bg-foreground"
                    : "w-1.5 h-1.5 bg-foreground/20 hover:bg-foreground/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ── Brands Carousel (auto-scroll) ─────────────────────────────── */
const BrandsCarousel = ({ title }: { title: string }) => {
  const { data: logos } = useManagedLogos("clients");
  const brands = logos?.filter((l) => l.visible) ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || brands.length < 2) return;
    let animId: number;
    let pos = 0;
    const speed = 0.4;
    const step = () => {
      pos += speed;
      if (pos >= el.scrollWidth / 2) pos = 0;
      el.scrollLeft = pos;
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    const pause = () => cancelAnimationFrame(animId);
    const resume = () => { animId = requestAnimationFrame(step); };
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
  }, [brands.length]);

  if (!brands.length) return null;
  const doubled = [...brands, ...brands];

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <SectionHeading>{title}</SectionHeading>
        <div
          ref={scrollRef}
          className="flex gap-10 md:gap-16 overflow-hidden items-center"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {doubled.map((brand, i) => (
            <div
              key={`brand-${i}`}
              className="flex items-center justify-center shrink-0 px-4 py-3 min-w-[140px] md:min-w-[180px]"
            >
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="max-h-10 md:max-h-12 max-w-[120px] md:max-w-[140px] object-contain opacity-40 hover:opacity-100 transition-opacity duration-300"
                />
              ) : (
                <span className="text-[11px] tracking-[0.15em] text-muted-foreground/50 hover:text-foreground font-medium uppercase transition-colors duration-300">
                  {brand.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── Main Page ─────────────────────────────────────────────────── */
const Company = () => {
  const { lang, isAl } = useLanguage();
  const { data: content } = usePageContent("company", lang);
  const { data: homeContent } = usePageContent("home", lang);
  const { settings } = useDesign();

  const t = (al: string, en: string) => (isAl ? al : en);

  const g = (sectionKey: string, fieldKey: string, fallback: string) =>
    getContentValue(content, sectionKey, fieldKey, fallback);

  const ds = (key: string, fallback: string) => {
    const alKey = `${key}_al`;
    const enKey = `${key}_en`;
    return isAl ? (settings[alKey] || fallback) : (settings[enKey] || fallback);
  };

  const { data: galleryImages } = useGalleryImages("company");
  const carouselImages = galleryImages?.length
    ? galleryImages.map((img) => img.image_url)
    : [philosophyImg, valuesImg, researchImg];

  const stats = [
    { value: ds("company_stat1_value", "50+"), label: ds("company_stat1_label", t("Vite Eksperiencë", "Years of Experience")) },
    { value: ds("company_stat2_value", "1500+"), label: ds("company_stat2_label", t("Klientë", "Clients")) },
    { value: ds("company_stat3_value", "500+"), label: ds("company_stat3_label", t("Produkte", "Products")) },
    { value: ds("company_stat4_value", "12+"), label: ds("company_stat4_label", t("Vende", "Countries")) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ── 1. Hero ──────────────────────────────────────────────── */}
      <section className="relative h-[45vh] md:h-[60vh] overflow-hidden">
        <img
          src={g("hero", "image", heroImg)}
          alt="Company"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-white/60 mb-4">
            {g("hero", "subtitle", t("Premium Tekstile Hotelerie", "Premium Hotel Textiles"))}
          </p>
          <h1 className="text-3xl md:text-5xl font-light tracking-[0.15em] text-white">
            {g("hero", "title", t("RRETH NESH", "ABOUT US"))}
          </h1>
          <div className="w-8 h-px bg-white/40 mt-6" />
        </div>
      </section>

      {/* ── 2. Story ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-32">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-foreground tracking-[0.08em] mb-3">
            {g("story", "title", "EGJEU")}
          </h2>
          <div className="w-8 h-px bg-foreground/20 mx-auto mb-10" />

          <div className="space-y-6 text-sm md:text-[15px] text-muted-foreground leading-[1.85] text-left">
            <p>
              {g("story", "paragraph1", t(
                "E themeluar me pasionin për tekstile cilësore, EGJEU ka ndërtuar një traditë dekadash në prodhimin e produkteve premium për industrinë e hotelerisë. Duke kombinuar artizanatin tradicional me teknologjinë moderne, kemi krijuar një emër sinonim me cilësinë.",
                "Founded with a passion for quality textiles, EGJEU has built a decades-long tradition in producing premium products for the hospitality industry. By combining traditional craftsmanship with modern technology, we have created a name synonymous with quality."
              ))}
            </p>
            <p>
              {g("story", "paragraph2", t(
                "EGJEU ka prodhuar pëlhura si dhe mbulesa shtrati, banje dhe tavoline për mbi 50 vjet, duke u bërë lider në sektorin e hoteleve luksoze, spa, jahte, banketeve dhe pronave ekskluzive.",
                "EGJEU has been producing fabrics as well as bed, bath and table linens for over 50 years, becoming leader in the luxury hotel, spa, yachting, banqueting and exclusive property sector."
              ))}
            </p>
            <p>
              {g("story", "paragraph3", t(
                "Kënaqësia e klientit dhe shërbimi i personalizuar i pakrahasueshëm kanë qenë gjithmonë garancia e markës sonë. Produktet tona dallohen për një zinxhir prodhimi plotësisht të kontrolluar, nga fija deri te paketimi.",
                "Customer satisfaction and unparalleled bespoke service have always been our brand guarantee. Our products distinguish themselves for a fully-controlled production chain, from the yarn to the packaging."
              ))}
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. Image Carousel ────────────────────────────────────── */}
      <section className="pb-20 md:pb-32">
        <div className="max-w-3xl mx-auto px-6">
          <ImageCarousel images={carouselImages} />
        </div>
      </section>

      {/* ── 4. Statistics ────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <SectionHeading>
            {ds("company_stats_title", t("NUMRAT TANË", "OUR NUMBERS"))}
          </SectionHeading>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <span className="text-3xl md:text-4xl font-extralight tracking-wide text-foreground block mb-2">
                  {stat.value}
                </span>
                <span className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Brands Carousel ───────────────────────────────────── */}
      <BrandsCarousel
        title={ds("company_brands_title", t("BRANDET TONA", "OUR BRANDS"))}
      />

      {/* ── 6. Certifications ────────────────────────────────────── */}
      <div className="bg-muted/30">
        <CertificationsSection content={homeContent} />
      </div>

      {/* ── 7. Call To Action ────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container text-center">
          <SectionHeading>
            {ds("company_cta_title", t("NA KONTAKTONI", "CONTACT US"))}
          </SectionHeading>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
            {ds("company_cta_text", t(
              "Jemi të gatshëm t'ju ndihmojmë me zgjidhje të personalizuara për biznesin tuaj.",
              "We are ready to help you with customized solutions for your business."
            ))}
          </p>
          <Link
            to="/checkout"
            className="inline-flex items-center gap-3 px-10 py-4 text-[11px] tracking-[0.25em] uppercase text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#163058" }}
          >
            {ds("company_cta_button", t("KËRKO NJË OFERTË", "REQUEST A QUOTE"))}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Company;
