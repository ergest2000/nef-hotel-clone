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
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-foreground leading-tight whitespace-pre-line line-clamp-2">
              {slides[current].title}
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="absolute bottom-6 md:bottom-10 left-0 right-0">
        <div className="container flex items-center justify-between">
          <button
            onClick={() => goTo((current - 1 + slides.length) % slides.length)}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} strokeWidth={1} />
          </button>

          <div className="flex items-center gap-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="group p-1"
              >
                <span className={`block transition-all duration-500 ease-out ${
                  i === current
                    ? "w-8 h-[1.5px] bg-primary-foreground"
                    : "w-4 h-[1.5px] bg-primary-foreground/30 group-hover:bg-primary-foreground/60 group-hover:w-6"
                }`} />
              </button>
            ))}
          </div>

          <button
            onClick={() => goTo((current + 1) % slides.length)}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-300"
            aria-label="Next slide"
          >
            <ChevronRight size={20} strokeWidth={1} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
