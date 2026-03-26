import { useRef, useState, useEffect, useCallback } from "react";
import { useSuggestedProductsFull } from "@/hooks/useHomepageSuggestions";
import { useLanguage } from "@/hooks/useLanguage";
import { getContentValue } from "@/hooks/useCms";
import { ChevronLeft, ChevronRight } from "lucide-react";
import catBedroom from "@/assets/cat-bedroom.jpg";
import catBathroom from "@/assets/cat-bathroom.jpg";
import catPool from "@/assets/cat-pool.jpg";
import catSpa from "@/assets/cat-spa.jpg";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

/* ── Title Case helper ─────────────────────────────────────────── */
const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .replace(/(?:^|\s|[-/])\S/g, (match) => match.toUpperCase());

const defaultProducts = [
  { key: "prod1", name: "Premium Cotton Sheet Set", category: "Bedroom", image: catBedroom },
  { key: "prod2", name: "Luxury Bath Towel Pack", category: "Bathroom", image: catBathroom },
  { key: "prod3", name: "Pool Towel Collection", category: "Pool", image: catPool },
  { key: "prod4", name: "Spa Robe Deluxe", category: "Spa", image: catSpa },
];

const SuggestionsSection = ({ content }: { content?: SiteContent[] }) => {
  const title = getContentValue(content, "suggestions", "title", "SUGGESTIONS FOR YOU");
  const { lang } = useLanguage();
  const { data: dynamicProducts } = useSuggestedProductsFull();

  const products = dynamicProducts?.length
    ? dynamicProducts.map((p: any) => ({
        name: lang === "en" ? (p.title_en || p.title_al) : (p.title_al || p.title_en),
        image: p.image_url || catBedroom,
        id: p.id,
        collectionSlug: p.collectionSlug || "all",
      }))
    : defaultProducts.map((def) => ({
        name: def.name,
        image: def.image,
        id: def.key,
        collectionSlug: "all",
      }));

  // ── Scroll logic ────────────────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const progress = el.scrollLeft / maxScroll;
    setScrollProgress(progress);
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < maxScroll - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, products.length]);

  const scrollBy = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    // Scroll by ~1 card width
    const cardWidth = el.querySelector("a")?.offsetWidth || 280;
    const amount = direction === "left" ? -cardWidth - 16 : cardWidth + 16;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Title row with arrows */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1" />
          <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center">
            {title}
          </h2>
          <div className="flex-1 flex justify-end gap-2">
            <button
              onClick={() => scrollBy("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className={`w-10 h-10 md:w-11 md:h-11 border flex items-center justify-center transition-colors ${
                canScrollLeft
                  ? "border-foreground/30 text-foreground hover:bg-foreground hover:text-background"
                  : "border-border text-muted-foreground/30 cursor-default"
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollBy("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className={`w-10 h-10 md:w-11 md:h-11 border flex items-center justify-center transition-colors ${
                canScrollRight
                  ? "border-foreground/30 text-foreground hover:bg-foreground hover:text-background"
                  : "border-border text-muted-foreground/30 cursor-default"
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Slider wrapper */}
        <div className="relative">
          {/* Scrollable product row */}
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth scrollbar-hide px-1 pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <a
                key={product.id}
                href={`/koleksionet/${product.collectionSlug}/${product.id}`}
                className="group shrink-0 w-[45vw] sm:w-[35vw] md:w-[22%] lg:w-[18%]"
              >
                <div className="aspect-square overflow-hidden mb-3 bg-secondary">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <p
                  className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2"
                  style={{ textTransform: "none", letterSpacing: "normal" }}
                >
                  {toTitleCase(product.name)}
                </p>
              </a>
            ))}
          </div>

          {/* Scrollbar indicator */}
          <div className="mt-6 mx-auto max-w-2xl">
            <div className="h-[3px] bg-muted rounded-full relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-150"
                style={{
                  width: `${Math.max(20, 100 / Math.max(products.length / 4, 1))}%`,
                  transform: `translateX(${scrollProgress * (100 / Math.max(20, 100 / Math.max(products.length / 4, 1)) - 1) * 100}%)`,
                  left: `${scrollProgress * (100 - Math.max(20, 100 / Math.max(products.length / 4, 1)))}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuggestionsSection;
