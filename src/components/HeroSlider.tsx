import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getContentValue } from "@/hooks/useCms";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const defaultSlides = [
  { image: hero1, title: "Making hotel rooms\nfeel like home" },
  { image: hero2, title: "Luxury bathroom\ncollection" },
  { image: hero3, title: "Pool & outdoor\nessentials" },
];

const HeroSlider = ({ content }: { content?: SiteContent[] }) => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const slides = defaultSlides.map((def, i) => {
    const idx = i + 1;
    const title = getContentValue(content, "hero", `slide${idx}_title`, def.title);
    const imageVal = getContentValue(content, "hero", `slide${idx}_image`, "");
    const image = imageVal && !imageVal.startsWith("/src/") ? imageVal : def.image;
    const overlayVal = getContentValue(content, "hero", `slide${idx}_overlay`, "50");
    const overlay = Math.min(100, Math.max(0, parseInt(overlayVal) || 50));
    return { image, title, overlay };
  });

  const goTo = useCallback((index: number) => {
    setIsAnimating(false);
    setTimeout(() => {
      setCurrent(index);
      setIsAnimating(true);
    }, 50);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current, goTo, slides.length]);

  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, hsl(var(--background) / ${slide.overlay / 100}), hsl(var(--background) / ${slide.overlay / 300}), transparent)` }} />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center">
        <div className="container">
          <div className={`max-w-lg transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-light text-foreground leading-tight whitespace-pre-line" style={{ fontSize: `var(--ds-font-size-h1, 36px)`, fontWeight: `var(--ds-font-weight, 300)` }}>
              {slides[current].title}
            </h1>
          </div>
        </div>
      </div>

      {/* Glass arrows */}
      <button onClick={() => goTo((current - 1 + slides.length) % slides.length)} className="absolute left-3 md:left-6 bottom-16 md:bottom-8 w-9 h-9 md:w-11 md:h-11 rounded-full backdrop-blur-md bg-background/10 border border-primary-foreground/10 flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground hover:bg-background/20 transition-all">
        <ChevronLeft size={18} strokeWidth={1.5} />
      </button>
      <button onClick={() => goTo((current + 1) % slides.length)} className="absolute right-3 md:right-6 bottom-16 md:bottom-8 w-9 h-9 md:w-11 md:h-11 rounded-full backdrop-blur-md bg-background/10 border border-primary-foreground/10 flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground hover:bg-background/20 transition-all">
        <ChevronRight size={18} strokeWidth={1.5} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="group relative flex items-center justify-center"
          >
            <span className={`block rounded-full transition-all duration-500 ${
              i === current
                ? "w-8 h-2.5 bg-primary"
                : "w-2 h-2 bg-muted-foreground/30 group-hover:bg-muted-foreground/60"
            }`} />
          </button>
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
