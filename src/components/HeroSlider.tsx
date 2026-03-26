import { useState, useEffect, useCallback } from "react";
import { getContentValue } from "@/hooks/useCms";
import type { Tables } from "@/integrations/supabase/types";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

type SiteContent = Tables<"site_content">;

// Fallback lokal nëse CMS nuk ka imazhe të ngarkuara
const FALLBACK_SLIDES = [hero1, hero2, hero3];
const AUTOPLAY_INTERVAL = 5000;

/**
 * HeroSlider — i lidhur plotësisht me CMS.
 * Dashboard → "Faqja Kryesore" → seksioni "hero"
 *
 * Fushat në site_content (page="home", section_key="hero"):
 *   title      (text)   — titulli kryesor
 *   subtitle   (text)   — nëntitulli
 *   cta_label  (text)   — teksti i butonit
 *   cta_link   (link)   — linku i butonit
 *   slide1     (image)  — imazhi i parë
 *   slide2     (image)  — imazhi i dytë
 *   slide3     (image)  — imazhi i tretë
 */
const HeroSlider = ({ content }: { content?: SiteContent[] }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // ── Tekste nga CMS ────────────────────────────────────────────
  const heroTitle    = getContentValue(content, "hero", "title",     "TEKSTILE HOTELIERE");
  const heroSubtitle = getContentValue(content, "hero", "subtitle",  "Cilësi dhe elegancë për hotelet tuaja");
  const heroCtaLabel = getContentValue(content, "hero", "cta_label", "Zbulo Koleksionet");
  const heroCtaLink  = getContentValue(content, "hero", "cta_link",  "/koleksionet");

  // ── Imazhet nga CMS (me fallback vendor lokal) ────────────────
  const raw1 = getContentValue(content, "hero", "slide1", "");
  const raw2 = getContentValue(content, "hero", "slide2", "");
  const raw3 = getContentValue(content, "hero", "slide3", "");

  const slide1 = raw1 && !raw1.startsWith("/src/") ? raw1 : FALLBACK_SLIDES[0];
  const slide2 = raw2 && !raw2.startsWith("/src/") ? raw2 : FALLBACK_SLIDES[1];
  const slide3 = raw3 && !raw3.startsWith("/src/") ? raw3 : FALLBACK_SLIDES[2];
  const slides = [slide1, slide2, slide3];

  // ── Navigim ───────────────────────────────────────────────────
  const goTo   = useCallback((i: number) => setCurrent((i + slides.length) % slides.length), [slides.length]);
  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, goNext]);

  return (
    <section
      className="relative w-full h-[60vh] md:h-[88vh] overflow-hidden bg-foreground"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <img
            src={src}
            alt={`Hero slide ${i + 1}`}
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/55" />

      {/* Teksti nga CMS */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-[0.12em] text-white uppercase mb-6 max-w-3xl leading-tight">
          {heroTitle}
        </h1>
        {heroSubtitle && (
          <p className="text-sm md:text-base text-white/70 font-light tracking-wide max-w-xl mb-10">
            {heroSubtitle}
          </p>
        )}
        {heroCtaLabel && (
          <a
            href={heroCtaLink}
            className="inline-block border border-white/80 text-white text-xs tracking-[0.25em] uppercase px-8 py-3 hover:bg-white hover:text-foreground transition-colors duration-300"
          >
            {heroCtaLabel}
          </a>
        )}
      </div>

      {/* Shigjeta e majtë */}
      <button
        onClick={goPrev}
        aria-label="Slide i mëparshëm"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white/40 text-white hover:bg-white/20 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Shigjeta e djathtë */}
      <button
        onClick={goNext}
        aria-label="Slide tjetër"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white/40 text-white hover:bg-white/20 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Shko te slide ${i + 1}`}
            className={`h-[2px] transition-all duration-300 ${
              i === current ? "bg-white w-8" : "bg-white/40 w-4 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
