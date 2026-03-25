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
  { image: hero1, titleAl: "Oferta Ekskluzive për Hotelin Tuaj", titleEn: "Exclusive Offers for Your Hotel" },
  { image: hero2, titleAl: "Partneri Juaj për Tekstile Cilësore", titleEn: "Your Partner for Quality Textiles" },
  { image: hero3, titleAl: "Produktet e Hotelit Tuaj, në Një Vend", titleEn: "Your Hotel Products, in One Place" },
];

var HeroSlider = function ({ content }: { content?: SiteContent[] }) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const { isAl } = useLanguage();

  var slides = defaultSlides.map(function (def, i) {
    var idx = i + 1;
    var titleAl = getContentValue(content, "hero", "slide" + idx + "_title_al", def.titleAl);
    var titleEn = getContentValue(content, "hero", "slide" + idx + "_title_en", def.titleEn);
    var title = getContentValue(content, "hero", "slide" + idx + "_title", isAl ? def.titleAl : def.titleEn);
    var displayTitle = isAl ? (titleAl || title) : (titleEn || title);
    var imageVal = getContentValue(content, "hero", "slide" + idx + "_image", "");
    var image = imageVal && !imageVal.startsWith("/src/") ? imageVal : def.image;
    var overlayVal = getContentValue(content, "hero", "slide" + idx + "_overlay", "50");
    var overlay = Math.min(100, Math.max(0, parseInt(overlayVal) || 50));
    var overlayColor = getContentValue(content, "hero", "slide" + idx + "_overlay_color", "0,0,0");
    var fontSize = getContentValue(content, "hero", "slide" + idx + "_font_size", "36");
    var fontColor = getContentValue(content, "hero", "slide" + idx + "_font_color", "#ffffff");
    return { image: image, title: displayTitle, overlay: overlay, overlayColor: overlayColor, fontSize: fontSize, fontColor: fontColor };
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
        var overlayParts = slide.overlayColor.split(",").map(function (s) { return s.trim(); });
        var r = overlayParts[0] || "0";
        var g = overlayParts[1] || "0";
        var b = overlayParts[2] || "0";
        var overlayBg = "linear-gradient(to right, rgba(" + r + "," + g + "," + b + "," + (slide.overlay / 100) + "), rgba(" + r + "," + g + "," + b + "," + (slide.overlay / 300) + "), transparent)";
        return (
          <div key={i} className={"absolute inset-0 transition-opacity duration-700 " + (i === current ? "opacity-100" : "opacity-0")}>
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
            <div className="absolute inset-0" style={{ background: overlayBg }} />
          </div>
        );
      })}

      <div className="absolute inset-0 flex items-center">
        <div className="container">
          <div className={"max-w-lg transition-all duration-700 " + (isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
            <h1
              className="text-2xl md:text-4xl lg:text-5xl font-light leading-tight whitespace-pre-line"
              style={{
                fontSize: slides[current].fontSize + "px",
                color: slides[current].fontColor,
                fontWeight: 300,
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              {slides[current].title}
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
