import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getContentValue } from "@/hooks/useCms";
import { useLanguage } from "@/hooks/useLanguage";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

var defaultSlides = [
  { image: hero1, line1Al: "Oferta Ekskluzive", line2Al: "për Hotelin Tuaj", line1En: "Exclusive Offers", line2En: "for Your Hotel" },
  { image: hero2, line1Al: "Partneri Juaj", line2Al: "për Tekstile Cilësore", line1En: "Your Partner", line2En: "for Quality Textiles" },
  { image: hero3, line1Al: "Produktet e Hotelit Tuaj", line2Al: "në Një Vend", line1En: "Your Hotel Products", line2En: "in One Place" },
];

var HeroSlider = function ({ content }: { content?: SiteContent[] }) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const { isAl } = useLanguage();

  var slides = defaultSlides.map(function (def, i) {
    var idx = i + 1;
    var line1Al = getContentValue(content, "hero", "slide" + idx + "_line1_al", def.line1Al);
    var line1En = getContentValue(content, "hero", "slide" + idx + "_line1_en", def.line1En);
    var line2Al = getContentValue(content, "hero", "slide" + idx + "_line2_al", def.line2Al);
    var line2En = getContentValue(content, "hero", "slide" + idx + "_line2_en", def.line2En);
    var line1 = isAl ? line1Al : line1En;
    var line2 = isAl ? line2Al : line2En;
    var imageVal = getContentValue(content, "hero", "slide" + idx + "_image", "");
    var image = imageVal && !imageVal.startsWith("/src/") ? imageVal : def.image;
    var overlayVal = getContentValue(content, "hero", "slide" + idx + "_overlay", "50");
    var overlay = Math.min(100, Math.max(0, parseInt(overlayVal) || 50));
    var overlayColor = getContentValue(content, "hero", "slide" + idx + "_overlay_color", "0,0,0");
    var line1Size = getContentValue(content, "hero", "slide" + idx + "_line1_size", "42");
    var line2Size = getContentValue(content, "hero", "slide" + idx + "_line2_size", "42");
    var fontColor = getContentValue(content, "hero", "slide" + idx + "_font_color", "#ffffff");
    return {
      image: image,
      line1: line1,
      line2: line2,
      overlay: overlay,
      overlayColor: overlayColor,
      line1Size: line1Size,
      line2Size: line2Size,
      fontColor: fontColor,
    };
  });

  var goTo = useCallback(function (index: number) {
    setIsAnimating(false);
    setTimeout(function () {
      setCurrent(index);
      setIsAnimating(true);
    }, 50);
  }, []);

  useEffect(function () {
    var timer = setInterval(function () {
      goTo((current + 1) % slides.length);
    }, 5000);
    return function () { clearInterval(timer); };
  }, [current, goTo, slides.length]);

  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
      {slides.map(function (slide, i) {
        var parts = slide.overlayColor.split(",").map(function (s) { return s.trim(); });
        var r = parts[0] || "0";
        var g = parts[1] || "0";
        var b = parts[2] || "0";
        var overlayBg = "linear-gradient(to right, rgba(" + r + "," + g + "," + b + "," + (slide.overlay / 100) + "), rgba(" + r + "," + g + "," + b + "," + (slide.overlay / 300) + "), transparent)";
        return (
          <div key={i} className={"absolute inset-0 transition-opacity duration-700 " + (i === current ? "opacity-100" : "opacity-0")}>
            <img src={slide.image} alt={slide.line1} className="w-full h-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
            <div className="absolute inset-0" style={{ background: overlayBg }} />
          </div>
        );
      })}

      <div className="absolute inset-0 flex items-center">
        <div className="container">
          <div className={"max-w-2xl transition-all duration-700 " + (isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
            <h1
              className="font-light leading-tight"
              style={{
                color: slides[current].fontColor,
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              <span style={{ fontSize: slides[current].line1Size + "px", display: "block" }}>
                {slides[current].line1}
              </span>
              <span style={{ fontSize: slides[current].line2Size + "px", display: "block" }}>
                {slides[current].line2}
              </span>
            </h1>
          </div>
        </div>
      </div>

      <button onClick={function () { goTo((current - 1 + slides.length) % slides.length); }} className="absolute left-3 md:left-6 bottom-16 md:bottom-8 w-9 h-9 md:w-11 md:h-11 rounded-full backdrop-blur-md bg-background/10 border border-primary-foreground/10 flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground hover:bg-background/20 transition-all">
        <ChevronLeft size={18} strokeWidth={1.5} />
      </button>
      <button onClick={function () { goTo((current + 1) % slides.length); }} className="absolute right-3 md:right-6 bottom-16 md:bottom-8 w-9 h-9 md:w-11 md:h-11 rounded-full backdrop-blur-md bg-background/10 border border-primary-foreground/10 flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground hover:bg-background/20 transition-all">
        <ChevronRight size={18} strokeWidth={1.5} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map(function (_, i) {
          return (
            <button key={i} onClick={function () { goTo(i); }} className="group relative flex items-center justify-center">
              <span className={"block rounded-full transition-all duration-500 " + (i === current ? "w-8 h-2.5 bg-primary" : "w-2 h-2 bg-muted-foreground/30 group-hover:bg-muted-foreground/60")} />
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default HeroSlider;
