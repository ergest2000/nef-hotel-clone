import { useState, useEffect, useCallback } from "react";
import { getContentValue } from "@/hooks/useCms";
import type { Tables } from "@/integrations/supabase/types";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

type SiteContent = Tables<"site_content">;

const defaultSlides = [
  { src: hero1, alt: "Hero 1" },
  { src: hero2, alt: "Hero 2" },
  { src: hero3, alt: "Hero 3" },
];

const AUTOPLAY_INTERVAL = 5000;

const HeroSlider = ({ content }: { content?: SiteContent[] }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const heroTitle = getContentValue(content, "hero", "title", "TEKSTILE HOTELIERE");
  const heroSubtitle = getContentValue(content, "hero", "subtitle", "Cilësi dhe elegancë për hotelet tuaja");
  const heroCtaLabel = getContentValue(content, "hero", "cta_label", "Zbulo Koleksionet");

  const goTo = useCallback((index: number) => {
    setCurrent((index + defaultSlides.length) % defaultSlides.length);
  }, []);

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
      {defaultSlides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <img
            src={slide.src}
            alt={slide.alt}
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <p className="text-xs md:text-sm tracking-[0.3em] text-white/80 uppercase mb-4 font-light">
          EGJEU
        </p>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-[0.15em] text-white uppercase mb-6 max-w-3xl leading-tight">
          {heroTitle}
        </h1>
        <p className="text-sm md:text-base text-white/75 font-light tracking-wide max-w-xl mb-10">
          {heroSubtitle}
        </p>
        <a
          href="/koleksionet"
          className="inline-block border border-white text-white text-xs tracking-[0.25em] uppercase px-8 py-3 hover:bg-white hover:text-foreground transition-colors duration-300"
        >
          {heroCtaLabel}
        </a>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={goPrev}
        aria-label="Slide i mëparshëm"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white/50 text-white hover:bg-white/20 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={goNext}
        aria-label="Slide tjetër"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white/50 text-white hover:bg-white/20 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {defaultSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Shko te slide ${i + 1}`}
            className={`transition-all duration-300 h-[2px] rounded-none ${
              i === current
                ? "bg-white w-8"
                : "bg-white/40 w-4 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
