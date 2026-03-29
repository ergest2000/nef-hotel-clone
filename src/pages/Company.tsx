import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { usePageContent, usePageSections, getContentValue } from "@/hooks/useCms";
import { useLanguage } from "@/hooks/useLanguage";
import { useManagedLogos } from "@/hooks/useManagedLogos";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

import heroImg from "@/assets/company-hero.jpg";

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <div className="text-center mb-10 md:mb-14">
    <h2 className="text-lg md:text-xl tracking-[0.25em] uppercase font-light text-foreground">{children}</h2>
    <div className="w-8 h-px mx-auto mt-4 bg-foreground/20" />
  </div>
);

/* ── Count-up animation hook ───────────────────────────────────── */
const useCountUp = (target: string, duration = 1800) => {
  const [count, setCount] = useState("0");
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse numeric part and suffix (e.g. "1500+" → 1500, "+")
  const { num, suffix } = useMemo(() => {
    const match = target.match(/^([\d,.]+)(.*)$/);
    if (!match) return { num: 0, suffix: target };
    return { num: parseFloat(match[1].replace(/,/g, "")), suffix: match[2] };
  }, [target]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || num === 0) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * num);
      setCount(current.toLocaleString() + suffix);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, num, suffix, duration]);

  return { ref, display: started ? count : "0" + suffix };
};

/* ── Animated Stat ─────────────────────────────────────────────── */
const AnimatedStat = ({ value, label }: { value: string; label: string }) => {
  const { ref, display } = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <span className="text-3xl md:text-4xl font-extralight tracking-wide text-foreground block mb-2">{display}</span>
      <span className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-muted-foreground">{label}</span>
    </div>
  );
};

/* ── Image Carousel ────────────────────────────────────────────── */
const ImageCarousel = ({ images }: { images: { image_url: string; alt_text: string }[] }) => {
  const [current, setCurrent] = useState(0);
  const total = images.length;
  if (!total) return null;
  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img src={images[current].image_url} alt={images[current].alt_text || ""} className="w-full h-full object-cover transition-opacity duration-500" key={current} />
      </div>
      {total > 1 && (
        <div className="flex items-center justify-center mt-6">
          <div className="flex gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-foreground" : "bg-foreground/20 hover:bg-foreground/40"}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Clients Marquee (seamless infinite scroll) ────────────────── */
const ClientsMarquee = ({ clients }: { clients: { name: string; logo: string | null }[] }) => {
  if (!clients.length) return null;
  // Triple for seamless loop
  const tripled = [...clients, ...clients, ...clients];
  const duration = Math.max(clients.length * 3, 15);
  return (
    <div className="overflow-hidden">
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
      `}</style>
      <div
        className="flex items-center gap-14 md:gap-20 w-max"
        style={{ animation: `marquee ${duration}s linear infinite` }}
      >
        {tripled.map((c, i) => (
          <div key={i} className="flex items-center justify-center shrink-0">
            {c.logo ? (
              <img src={c.logo} alt={c.name} className="h-[40px] md:h-[50px] w-auto object-contain" />
            ) : (
              <span className="text-[11px] tracking-[0.15em] text-muted-foreground font-medium uppercase whitespace-nowrap">{c.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Brands static display (suppliers/partners) ───────────────── */
const BrandsDisplay = ({ brands }: { brands: { name: string; logo: string | null }[] }) => {
  if (!brands.length) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
      {brands.map((b, i) => (
        <div key={i} className="flex items-center justify-center">
          {b.logo ? (
            <img src={b.logo} alt={b.name} className="h-[60px] md:h-[80px] w-auto object-contain" />
          ) : (
            <span className="text-sm tracking-[0.15em] text-foreground font-medium uppercase whitespace-nowrap">{b.name}</span>
          )}
        </div>
      ))}
    </div>
  );
};

/* ── Services Carousel (Beltrami-style split layout) ───────────── */
const ServicesCarousel = ({ slides, isAl }: { slides: { title: string; text: string; image: string; link: string; color: string }[]; isAl: boolean }) => {
  const [current, setCurrent] = useState(0);
  const total = slides.length;
  const timerRef = useRef<number>();

  const next = () => setCurrent((c) => (c < total - 1 ? c + 1 : 0));
  const prev = () => setCurrent((c) => (c > 0 ? c - 1 : total - 1));

  // Auto-advance every 5s
  useEffect(() => {
    timerRef.current = window.setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [total]);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = window.setInterval(next, 5000);
  };

  if (!slides.length) return null;
  const slide = slides[current];

  return (
    <div className="relative overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px] md:min-h-[600px]">
        {/* Left: Text */}
        <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16" style={{ backgroundColor: slide.color || "#1a3a2a" }}>
          <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-6">{(current + 1).toString().padStart(2, "0")} / {total.toString().padStart(2, "0")}</span>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-light text-white leading-tight mb-4">
            {slide.title}
          </h3>
          <div className="w-10 h-px bg-white/30 mb-6" />
          <p className="text-sm md:text-base text-white/70 leading-relaxed mb-10 max-w-md">
            {slide.text}
          </p>
          <Link
            to={slide.link}
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-white border-b border-white/40 pb-1 hover:border-white transition-colors self-start"
          >
            {isAl ? "Shiko Produktet" : "Discover"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {/* Right: Image */}
        <div className="relative overflow-hidden bg-muted">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover transition-transform duration-700"
            key={current}
          />
        </div>
      </div>
      {/* Navigation */}
      {total > 1 && (
        <>
          {/* Dots on right edge */}
          <div className="hidden md:flex flex-col gap-2 absolute right-6 top-1/2 -translate-y-1/2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); resetTimer(); }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-foreground scale-125" : "bg-foreground/25 hover:bg-foreground/50"}`}
              />
            ))}
          </div>
          {/* Arrows bottom-left on text side */}
          <div className="absolute bottom-6 left-8 md:left-16 lg:left-24 flex gap-3 z-10">
            <button onClick={() => { prev(); resetTimer(); }} className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => { next(); resetTimer(); }} className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {/* Mobile dots */}
          <div className="md:hidden flex justify-center gap-2 py-4 bg-background">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); resetTimer(); }}
                className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-foreground" : "bg-foreground/20"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ── Page ───────────────────────────────────────────────────────── */
const Company = () => {
  const { lang, isAl } = useLanguage();
  const { data: content } = usePageContent("company", lang);
  const { data: sections } = usePageSections("company");
  const { data: galleryImages } = useGalleryImages("company");
  const t = (al: string, en: string) => (isAl ? al : en);
  const g = (sec: string, key: string, fb: string) => getContentValue(content, sec, key, fb);
  const vis = (key: string) => { if (!sections) return true; const s = sections.find((x) => x.section_key === key); return s ? s.visible : true; };
  const getImg = (sec: string, key: string, fb: string) => { const v = g(sec, key, ""); return v && !v.startsWith("/src/") ? v : fb; };

  // Clients (companies we work with) — marquee
  const { data: clientLogos } = useManagedLogos("clients");
  const clients = (clientLogos?.filter((l) => l.visible) ?? []).map((l) => ({ name: l.name, logo: l.logo_url }));

  // Brands/Suppliers (brands we use) — static
  const { data: supplierLogos } = useManagedLogos("suppliers");
  const suppliers = (supplierLogos?.filter((l) => l.visible) ?? []).map((l) => ({ name: l.name, logo: l.logo_url }));

  const { data: certLogos } = useManagedLogos("certifications");
  const certs = certLogos?.filter((l) => l.visible) ?? [];

  const stats = [
    { value: g("stats", "stat1_value", "20+"), label: g("stats", "stat1_label", t("Vite Eksperiencë", "Years of Experience")) },
    { value: g("stats", "stat2_value", "1500+"), label: g("stats", "stat2_label", t("Klientë", "Clients")) },
    { value: g("stats", "stat3_value", "500+"), label: g("stats", "stat3_label", t("Produkte", "Products")) },
  ];

  // Services slides from CMS (up to 6)
  const serviceSlides = [];
  for (let i = 1; i <= 6; i++) {
    const title = g("services", `slide${i}_title`, "");
    const text = g("services", `slide${i}_text`, "");
    const image = g("services", `slide${i}_image`, "");
    const link = g("services", `slide${i}_link`, "/koleksionet");
    const color = g("services", `slide${i}_color`, "#163058");
    if (title) serviceSlides.push({ title, text, image, link, color });
  }
  // Fallback slides if CMS is empty
  const defaultSlides = [
    { title: t("Tekstile\npër Hotele", "Textiles\nfor Hotels"), text: t("Ekspertizë, profesionalizëm dhe besueshmëri për hotelet më të mira.", "Expertise, professionalism and reliability for the best hotels."), image: heroImg, link: "/koleksionet", color: "#163058" },
    { title: t("Tekstile\npër SPA", "Textiles\nfor SPA"), text: t("Peshqirë, mbulesa dhe aksesorë premium për çdo SPA.", "Towels, linens and premium accessories for every SPA."), image: heroImg, link: "/koleksionet", color: "#2d4a3e" },
    { title: t("Tekstile\npër Restorante", "Textiles\nfor Restaurants"), text: t("Mbulesa tavoline, peceta dhe aksesorë elegante për ambiente luksoze.", "Tablecloths, napkins and elegant accessories for luxury environments."), image: heroImg, link: "/koleksionet", color: "#3d2e1e" },
  ];
  const slides = serviceSlides.length > 0 ? serviceSlides : defaultSlides;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ── Hero: title first, subtitle below ────────────────────── */}
      {vis("hero") && (
        <section className="relative h-[45vh] md:h-[60vh] overflow-hidden">
          <img src={getImg("hero", "image", heroImg)} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl md:text-5xl font-light tracking-[0.15em] text-white">
              {g("hero", "title", t("RRETH NESH", "ABOUT US"))}
            </h1>
            <div className="w-8 h-px bg-white/40 my-5" />
            <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-white/60">
              {g("hero", "subtitle", t("Premium Tekstile Hotelerie", "Premium Hotel Textiles"))}
            </p>
          </div>
        </section>
      )}

      {/* ── Story ────────────────────────────────────────────────── */}
      {vis("story") && (
        <section className="py-20 md:py-32">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-light text-foreground tracking-[0.08em] mb-3">{g("story", "title", "EGJEU")}</h2>
            <div className="w-8 h-px bg-foreground/20 mx-auto mb-10" />
            <div className="space-y-6 text-sm md:text-[15px] text-muted-foreground leading-[1.85] text-left">
              <p>{g("story", "paragraph1", "")}</p>
              <p>{g("story", "paragraph2", "")}</p>
              <p>{g("story", "paragraph3", "")}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Gallery Carousel ─────────────────────────────────────── */}
      {vis("gallery") && galleryImages && galleryImages.length > 0 && (
        <section className="pb-20 md:pb-28 px-6">
          <ImageCarousel images={galleryImages} />
        </section>
      )}

      {/* ── Stats with count-up animation ────────────────────────── */}
      {vis("stats") && (
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <SectionHeading>{g("stats", "title", t("NUMRAT TANË", "OUR NUMBERS"))}</SectionHeading>
            <div className="grid grid-cols-3 gap-10 md:gap-6 max-w-3xl mx-auto">
              {stats.map((s, i) => (
                <AnimatedStat key={i} value={s.value} label={s.label} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Services Carousel (Beltrami-style) ──────────────────────── */}
      {vis("services") && slides.length > 0 && (
        <section>
          <ServicesCarousel slides={slides} isAl={isAl} />
        </section>
      )}

      {/* ── Clients Marquee (auto-scroll) ──────────────────────────── */}
      {vis("clients") && clients.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container">
            <SectionHeading>{g("clients", "title", t("KLIENTËT TANË", "OUR CLIENTS"))}</SectionHeading>
          </div>
          <ClientsMarquee clients={clients} />
        </section>
      )}

      {/* ── Brands / Suppliers (static) ──────────────────────────── */}
      {vis("brands") && suppliers.length > 0 && (
        <section className="py-16 md:py-24 border-t border-border">
          <div className="container">
            <SectionHeading>{g("brands", "title", t("BRANDET TONA", "OUR BRANDS"))}</SectionHeading>
            <BrandsDisplay brands={suppliers} />
          </div>
        </section>
      )}

      {/* ── Certifications: row with vertical dividers ───────────── */}
      {vis("certifications") && certs.length > 0 && (
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <SectionHeading>{g("certifications", "title", t("CERTIFIKIME", "CERTIFICATIONS"))}</SectionHeading>
            <div className="flex flex-col md:flex-row items-center justify-center">
              {certs.map((c, i) => (
                <div key={c.id} className="flex items-center">
                  {i > 0 && (
                    <div className="hidden md:block w-px h-16 bg-border/60 mx-10" />
                  )}
                  {i > 0 && (
                    <div className="md:hidden w-16 h-px bg-border/60 my-6" />
                  )}
                  <div className="flex items-center justify-center px-6 py-3">
                    {c.logo_url ? (
                      <img src={c.logo_url} alt={c.name} className="h-[80px] md:h-[100px] w-auto object-contain" />
                    ) : (
                      <span className="text-sm tracking-[0.15em] text-muted-foreground font-semibold uppercase">{c.name}</span>
                    )}
                  </div>
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
