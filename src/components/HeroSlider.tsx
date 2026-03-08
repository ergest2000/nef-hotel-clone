import { useState, useEffect, useCallback } from "react";
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
    return { image, title };
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
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
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

      {/* Elegant vertical dots on the right */}
      <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="group relative flex items-center justify-center"
          >
            <span className={`block rounded-full transition-all duration-500 ${
              i === current
                ? "w-2.5 h-8 bg-primary"
                : "w-2 h-2 bg-muted-foreground/30 group-hover:bg-muted-foreground/60"
            }`} />
          </button>
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
