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

function HeroSlider(props: { content?: SiteContent[] }) {
  var content = props.content;
  var currentState = useState(0);
  var current = currentState[0];
  var setCurrent = currentState[1];
  var animState = useState(true);
  var isAnimating = animState[0];
  var setIsAnimating = animState[1];
  var langHook = useLanguage();
  var isAl = langHook.isAl;

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
    var line1MobileSize = getContentValue(content, "hero", "slide" + idx + "_line1_mobile_size", "20");
    var line2MobileSize = getContentValue(content, "hero", "slide" + idx + "_line2_mobile_size", "20");
    var fontColor = getContentValue(content, "hero", "slide" + idx + "_font_color", "#ffffff");
    return {
      image: image,
      line1: line1,
      line2: line2,
      overlay: overlay,
      overlayColor: overlayColor,
      line1Size: line1Size,
      line2Size: line2Size,
      line1MobileSize: line1MobileSize,
      line2MobileSize: line2MobileSize,
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

  var slide = slides[current];

  return (
    <section className="relative w-full h-[50vh] md:h-[80vh] overflow-hidden">
      {slides.map(function (s, i) {
        var parts = s.overlayColor.split(",").map(function (v) { return v.trim(); });
        var r = parts[0] || "0";
        var g = parts[1] || "0";
        var b = parts[2] || "0";
        var overlayBg = "linear-gradient(to right, rgba(" + r + "," + g + "," + b + "," + (s.overlay / 100) + "), rgba(" + r + "," + g + "," + b + "," + (s.overlay / 300) + "), transparent)";
        return (
          <div key={i} className={"absolute inset-0 transition-opacity duration-700 " + (i === current ? "opacity-100" : "opacity-0")}>
            <img src={s.image} alt={s.line1} className="w-full h-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
            <div className="absolute inset-0" style={{ background: overlayBg }} />
          </div>
        );
      })}

      <div className="absolute inset-0 flex items-center">
        <div className="container">
          <div className={"max-w-2xl transition-all duration-700 " + (isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
            <h1 className="font-light" style={{ color: slide.fontColor, textShadow: "0 2px 8px rgba(0,0,0,0.3)", lineHeight: 1.1 }}>
              <span className="block">
                <span className="hidden md:inline" style={{ fontSize: slide.line1Size + "px" }}>{slide.line1}</span>
                <span className="inline md:hidden" style={{ fontSize: slide.line1MobileSize + "px" }}>{slide.line1}</span>
              </span>
              <span className="block mt-1 md:mt-2">
                <span className="hidden md:inline" style={{ fontSize: slide.line2Size + "px" }}>{slide.line2}</span>
                <span className="inline md:hidden" style={{ fontSize: slide.line2MobileSize + "px" }}>{slide.line2}</span>
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
}

export default HeroSlider;
