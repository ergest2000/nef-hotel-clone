import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const slides = [
  { image: hero1, title: "Making hotel rooms\nfeel like home" },
  { image: hero2, title: "Luxury bathroom\ncollection" },
  { image: hero3, title: "Pool & outdoor\nessentials" },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

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
  }, [current, goTo]);

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

      {/* Text overlay */}
      <div className="absolute inset-0 flex items-center">
        <div className="container">
          <div className={`max-w-lg transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-foreground leading-tight whitespace-pre-line line-clamp-2">
              {slides[current].title}
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-3 h-3 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-muted-foreground/40"}`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button onClick={() => goTo((current - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors">
        <ChevronLeft size={36} />
      </button>
      <button onClick={() => goTo((current + 1) % slides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors">
        <ChevronRight size={36} />
      </button>
    </section>
  );
};

export default HeroSlider;
