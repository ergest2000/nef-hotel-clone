import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { usePageContent, usePageSections, getContentValue } from "@/hooks/useCms";
import { useLanguage } from "@/hooks/useLanguage";
import { useManagedLogos } from "@/hooks/useManagedLogos";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

import heroImg from "@/assets/company-hero.jpg";

/* ── Section Heading ───────────────────────────────────────────── */
const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <div className="text-center mb-10 md:mb-14">
    <h2 className="text-lg md:text-xl tracking-[0.25em] uppercase font-light text-foreground">
      {children}
    </h2>
    <div className="w-8 h-px mx-auto mt-4 bg-foreground/20" />
  </div>
);

/* ── Brands auto-scroll ────────────────────────────────────────── */
const BrandsCarousel = ({ brands }: { brands: { name: string; logo: string | null }[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || brands.length < 3) return;
    let id: number;
    let pos = 0;
    const step = () => {
      pos += 0.4;
      if (pos >= el.scrollWidth / 2) pos = 0;
      el.scrollLeft = pos;
      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    const pause = () => cancelAnimationFrame(id);
    const resume = () => { id = requestAnimationFrame(step); };
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    return () => { cancelAnimationFrame(id); el.removeEventListener("mouseenter", pause); el.removeEventListener("mouseleave", resume); };
  }, [brands.length]);

  if (!brands.length) return null;
  const doubled = [...brands, ...brands];

  return (
    <div
      ref={scrollRef}
      className="flex gap-10 md:gap-14 overflow-hidden items-center"
      style={{ scrollbarWidth: "none" }}
    >
      {doubled.map((b, i) => (
        <div key={i} className="flex items-center justify-center shrink-0 px-4 py-3 min-w-[140px] md:min-w-[180px]">
          {b.logo ? (
            <img src={b.logo} alt={b.name} className="max-h-10 md:max-h-12 max-w-[120px] md:max-w-[140px] object-contain opacity-40 hover:opacity-100 transition-opacity duration-300" />
          ) : (
            <span className="text-[11px] tracking-[0.15em] text-muted-foreground/50 hover:text-foreground font-medium uppercase transition-colors duration-300 whitespace-nowrap">{b.name}</span>
          )}
        </div>
      ))}
    </div>
  );
};

/* ── Page ───────────────────────────────────────────────────────── */
const Company = () => {
  const { lang, isAl } = useLanguage();
  const { data: content } = usePageContent("company", lang);
  const { data: sections } = usePageSections("company");

  const t = (al: string, en: string) => (isAl ? al : en);
  const g = (sec: string, key: string, fb: string) => getContentValue(content, sec, key, fb);
  const vis = (key: string) => {
    if (!sections) return true;
    const s = sections.find((x) => x.section_key === key);
    return s ? s.visible : true;
  };

  const getImg = (sec: string, key: string, fb: string) => {
    const v = g(sec, key, "");
    return v && !v.startsWith("/src/") ? v : fb;
  };

  // Brands from managed_logos "clients"
  const { data: brandLogos } = useManagedLogos("clients");
  const brands = (brandLogos?.filter((l) => l.visible) ?? []).map((l) => ({ name: l.name, logo: l.logo_url }));

  // Certifications from managed_logos "certifications"
  const { data: certLogos } = useManagedLogos("certifications");
  const certs = certLogos?.filter((l) => l.visible) ?? [];

  // Stats from CMS
  const stats = [
    { value: g("stats", "stat1_value", "50+"), label: g("stats", "stat1_label", t("Vite Eksperiencë", "Years of Experience")) },
    { value: g("stats", "stat2_value", "1500+"), label: g("stats", "stat2_label", t("Klientë", "Clients")) },
    { value: g("stats", "stat3_value", "500+"), label: g("stats", "stat3_label", t("Produkte", "Products")) },
    { value: g("stats", "stat4_value", "12+"), label: g("stats", "stat4_label", t("Vende", "Countries")) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      {vis("hero") && (
        <section className="relative h-[45vh] md:h-[60vh] overflow-hidden">
          <img src={getImg("hero", "image", heroImg)} alt="" className="w-full h-full object-cover" />
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
      )}

      {/* ── Story ────────────────────────────────────────────────── */}
      {vis("story") && (
        <section className="py-20 md:py-32">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-light text-foreground tracking-[0.08em] mb-3">
              {g("story", "title", "EGJEU")}
            </h2>
            <div className="w-8 h-px bg-foreground/20 mx-auto mb-10" />
            <div className="space-y-6 text-sm md:text-[15px] text-muted-foreground leading-[1.85] text-left">
              <p>{g("story", "paragraph1", "")}</p>
              <p>{g("story", "paragraph2", "")}</p>
              <p>{g("story", "paragraph3", "")}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Stats ────────────────────────────────────────────────── */}
      {vis("stats") && (
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <SectionHeading>
              {g("stats", "title", t("NUMRAT TANË", "OUR NUMBERS"))}
            </SectionHeading>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 max-w-4xl mx-auto">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <span className="text-3xl md:text-4xl font-extralight tracking-wide text-foreground block mb-2">{s.value}</span>
                  <span className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Brands ───────────────────────────────────────────────── */}
      {vis("brands") && brands.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container">
            <SectionHeading>
              {g("brands", "title", t("BRANDET TONA", "OUR BRANDS"))}
            </SectionHeading>
            <BrandsCarousel brands={brands} />
          </div>
        </section>
      )}

      {/* ── Certifications ───────────────────────────────────────── */}
      {vis("certifications") && certs.length > 0 && (
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <SectionHeading>
              {g("certifications", "title", t("CERTIFIKIME", "CERTIFICATIONS"))}
            </SectionHeading>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {certs.map((c) => (
                <div key={c.id} className="flex items-center justify-center px-6 py-3 border border-border bg-background">
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={c.name} className="max-h-10 max-w-[120px] object-contain" />
                  ) : (
                    <span className="text-xs tracking-brand text-muted-foreground font-semibold">{c.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────── */}
      {vis("cta") && (
        <section className="py-20 md:py-28">
          <div className="container text-center">
            <SectionHeading>
              {g("cta", "title", t("NA KONTAKTONI", "CONTACT US"))}
            </SectionHeading>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
              {g("cta", "text", t(
                "Jemi të gatshëm t'ju ndihmojmë me zgjidhje të personalizuara për biznesin tuaj.",
                "We are ready to help you with customized solutions for your business."
              ))}
            </p>
            <Link
              to="/checkout"
              className="inline-flex items-center gap-3 px-10 py-4 text-[11px] tracking-[0.25em] uppercase text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#163058" }}
            >
              {g("cta", "button", t("KËRKO NJË OFERTË", "REQUEST A QUOTE"))}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
};

export default Company;
