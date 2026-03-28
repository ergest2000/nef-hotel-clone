import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ClientsCarousel from "@/components/ClientsCarousel";
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
          className="w-full h-[300px] md:h-[450px] object-cover transition-opacity duration-500"
        />
      </div>
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center justify-center gap-2 mt-4">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === idx ? "bg-foreground" : "bg-foreground/20"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ── Brands Carousel (auto-scroll loop) ────────────────────────── */
const BrandsCarousel = ({ title }: { title: string }) => {
  const { data: logos } = useManagedLogos("clients");
  const brands = logos?.filter((l) => l.visible) ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || brands.length < 2) return;
    let animId: number;
    let pos = 0;
    const speed = 0.5;
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
    <section className="py-14 md:py-20 border-t border-border">
      <div className="container">
        <h2 className="text-lg tracking-wide-brand text-foreground font-light text-center mb-10">
          {title}
        </h2>
        <div
          ref={scrollRef}
          className="flex gap-8 md:gap-12 overflow-hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {doubled.map((brand, i) => (
            <div
              key={`brand-${i}`}
              className="flex items-center justify-center shrink-0 px-6 py-4 min-w-[160px] md:min-w-[200px]"
            >
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="max-h-12 max-w-[140px] object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              ) : (
                <span className="text-sm tracking-wide text-muted-foreground font-medium uppercase">
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

/* ── Main Company / About Us page ──────────────────────────────── */
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

  /* Gallery images — fallback to local assets */
  const { data: galleryImages } = useGalleryImages("company");
  const carouselImages = galleryImages?.length
    ? galleryImages.map((img) => img.image_url)
    : [philosophyImg, valuesImg, researchImg];

  /* Stats */
  const stats = [
    {
      value: ds("company_stat1_value", t("50+", "50+")),
      label: ds("company_stat1_label", t("Vite Eksperiencë", "Years of Experience")),
    },
    {
      value: ds("company_stat2_value", t("1500+", "1500+")),
      label: ds("company_stat2_label", t("Klientë", "Clients")),
    },
    {
      value: ds("company_stat3_value", t("500+", "500+")),
      label: ds("company_stat3_label", t("Produkte", "Products")),
    },
    {
      value: ds("company_stat4_value", t("12+", "12+")),
      label: ds("company_stat4_label", t("Vende", "Countries")),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ── 1. Hero ──────────────────────────────────────────────── */}
      <section className="relative h-[40vh] md:h-[55vh] overflow-hidden">
        <img
          src={g("hero", "image", heroImg)}
          alt="Company"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/40" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-brand text-white">
            {g("hero", "title", t("Rreth Nesh", "About Us"))}
          </h1>
        </div>
      </section>

      {/* ── 2. Main Story (Beltrami-style centered text) ─────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-foreground mb-2">
            {g("story", "title", "EGJEU")}
          </h2>
          <div className="w-12 h-[2px] bg-foreground mb-8" />

          <div className="space-y-5 text-sm md:text-[15px] text-muted-foreground leading-relaxed">
            <p>
              {g(
                "story",
                "paragraph1",
                t(
                  "E themeluar me pasionin për tekstile cilësore, EGJEU ka ndërtuar një traditë dekadash në prodhimin e produkteve premium për industrinë e hotelerisë. Duke kombinuar artizanatin tradicional me teknologjinë moderne, kemi krijuar një emër sinonim me cilësinë.",
                  "Founded with a passion for quality textiles, EGJEU has built a decades-long tradition in producing premium products for the hospitality industry. By combining traditional craftsmanship with modern technology, we have created a name synonymous with quality."
                )
              )}
            </p>
            <p>
              {g(
                "story",
                "paragraph2",
                t(
                  "EGJEU ka prodhuar pëlhura si dhe mbulesa shtrati, banje dhe tavoline për mbi 50 vjet, duke u bërë lider në sektorin e hoteleve luksoze, spa, jahte, banketeve dhe pronave ekskluzive.",
                  "EGJEU has been producing fabrics as well as bed, bath and table linens for over 50 years, becoming leader in the luxury hotel, spa, yachting, banqueting and exclusive property sector."
                )
              )}
            </p>
            <p>
              {g(
                "story",
                "paragraph3",
                t(
                  "Kënaqësia e klientit dhe shërbimi i personalizuar i pakrahasueshëm kanë qenë gjithmonë garancia e markës sonë. Produktet tona dallohen për një zinxhir prodhimi plotësisht të kontrolluar, nga fija deri te paketimi.",
                  "Customer satisfaction and unparalleled bespoke service have always been our brand guarantee. Our products distinguish themselves for a fully-controlled production chain, from the yarn to the packaging."
                )
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. Image Carousel ────────────────────────────────────── */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <ImageCarousel images={carouselImages} />
        </div>
      </section>

      {/* ── 4. Statistics ────────────────────────────────────────── */}
      <section className="py-14 md:py-20 border-t border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <span className="text-3xl md:text-4xl font-light tracking-brand text-foreground block mb-1">
                  {stat.value}
                </span>
                <span className="text-[10px] md:text-xs tracking-wider uppercase text-muted-foreground">
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

      {/* ── 6. Clients ───────────────────────────────────────────── */}
      <ClientsCarousel content={homeContent} />

      {/* ── 7. Certifications ────────────────────────────────────── */}
      <CertificationsSection content={homeContent} />

      {/* ── 8. Call To Action ────────────────────────────────────── */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container text-center">
          <h2 className="text-lg tracking-wide-brand text-foreground font-light mb-4">
            {ds(
              "company_cta_title",
              t("Na Kontaktoni për Ofertë", "Contact Us for a Quote")
            )}
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
            {ds(
              "company_cta_text",
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
            {ds(
              "company_cta_button",
              t("KËRKO NJË OFERTË", "REQUEST A QUOTE")
            )}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Company;
