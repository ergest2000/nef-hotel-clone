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

const toTitleCase = (str: string) =>
  str.toLowerCase().replace(/(?:^|\s|[-/])\S/g, (m) => m.toUpperCase());

const defaultProducts = [
  { key: "prod1", name: "Premium Cotton Sheet Set", image: catBedroom },
  { key: "prod2", name: "Luxury Bath Towel Pack", image: catBathroom },
  { key: "prod3", name: "Pool Towel Collection", image: catPool },
  { key: "prod4", name: "Spa Robe Deluxe", image: catSpa },
  { key: "prod5", name: "Egyptian Cotton Pillowcase", image: catBedroom },
  { key: "prod6", name: "Deluxe Bath Mat", image: catBathroom },
  { key: "prod7", name: "Beach Towel Premium", image: catPool },
  { key: "prod8", name: "Wellness Robe Classic", image: catSpa },
];

/* gap between cards in px */
const GAP = 20;

/** Returns the number of visible cards based on window width */
const getVisibleCount = (): number => {
  if (typeof window === "undefined") return 4;
  const w = window.innerWidth;
  if (w < 640) return 2;
  if (w < 1024) return 3;
  return 4;
};

const SuggestionsSection = ({ content }: { content?: SiteContent[] }) => {
  const title = getContentValue(content, "suggestions", "title", "SUGGESTIONS FOR YOU");
  const { lang } = useLanguage();
  const { data: dynamicProducts } = useSuggestedProductsFull();

  const products = dynamicProducts?.length
    ? dynamicProducts.map((p: any) => ({
        name: lang === "en" ? (p.title_en || p.title_al) : (p.title_al || p.title_en),
        image: p.image_url || catBedroom,
        id: p.id,
        slug: p.slug || p.id,
        collectionSlug: p.collectionSlug || "all",
      }))
    : defaultProducts.map((def) => ({
        name: def.name,
        image: def.image,
        id: def.key,
        slug: def.key,
        collectionSlug: "all",
      }));

  /* ── state ─────────────────────────────────────────────────────── */
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(getVisibleCount);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const maxIndex = Math.max(0, products.length - visibleCount);
  const canLeft = currentIndex > 0;
  const canRight = currentIndex < maxIndex;

  /* ── resize ────────────────────────────────────────────────────── */
  useEffect(() => {
    const onResize = () => {
      const newCount = getVisibleCount();
      setVisibleCount(newCount);
      setCurrentIndex((prev) => Math.min(prev, Math.max(0, products.length - newCount)));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [products.length]);

  /* ── navigate ──────────────────────────────────────────────────── */
  const slide = useCallback(
    (dir: "left" | "right") => {
      setCurrentIndex((prev) => {
        if (dir === "left") return Math.max(0, prev - 1);
        return Math.min(maxIndex, prev + 1);
      });
    },
    [maxIndex]
  );

  /* ── touch / swipe ─────────────────────────────────────────────── */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setIsSwiping(true);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    touchDeltaX.current = delta;
    setSwipeOffset(delta);
  }, [isSwiping]);

  const onTouchEnd = useCallback(() => {
    setIsSwiping(false);
    setSwipeOffset(0);
    const threshold = 50;
    if (touchDeltaX.current < -threshold) {
      slide("right");
    } else if (touchDeltaX.current > threshold) {
      slide("left");
    }
    touchDeltaX.current = 0;
  }, [slide]);

  /* ── mouse drag (desktop) ──────────────────────────────────────── */
  const isDragging = useRef(false);
  const mouseStartX = useRef(0);
  const mouseDelta = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    mouseStartX.current = e.clientX;
    mouseDelta.current = 0;
    setIsSwiping(true);
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const delta = e.clientX - mouseStartX.current;
      mouseDelta.current = delta;
      setSwipeOffset(delta);
    },
    []
  );

  const onMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsSwiping(false);
    setSwipeOffset(0);
    const threshold = 50;
    if (mouseDelta.current < -threshold) {
      slide("right");
    } else if (mouseDelta.current > threshold) {
      slide("left");
    }
    mouseDelta.current = 0;
  }, [slide]);

  const onMouseLeave = useCallback(() => {
    if (isDragging.current) onMouseUp();
  }, [onMouseUp]);

  /* ── prevent click after drag ──────────────────────────────────── */
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (Math.abs(mouseDelta.current) > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  /* ── compute translateX ────────────────────────────────────────── */
  // Each card = (100% / visibleCount) with gap adjustments
  // translateX = -(currentIndex * (cardWidth + gap)) + swipeOffset
  const cardPercent = 100 / visibleCount;
  const gapPerCard = GAP * (visibleCount - 1) / visibleCount;
  const translatePx = -(currentIndex * gapPerCard + currentIndex * GAP) + swipeOffset;
  const translatePercent = -(currentIndex * cardPercent);

  /* ── progress bar ──────────────────────────────────────────────── */
  const progress = maxIndex > 0 ? currentIndex / maxIndex : 0;
  const thumbW = Math.max(20, Math.min(50, (visibleCount / products.length) * 100));

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Title */}
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-12">
          {title}
        </h2>

        {/* ── Slider wrapper with overlay arrows ─────────────────── */}
        <div className="relative group/slider">
          {/* ← Arrow */}
          <button
            onClick={() => slide("left")}
            disabled={!canLeft}
            aria-label="Scroll left"
            className={`
              absolute top-1/2 -translate-y-[calc(50%+16px)] z-30
              left-2 md:-left-5 lg:-left-6
              w-10 h-10 md:w-12 md:h-12
              rounded-full bg-white shadow-lg border border-gray-200
              flex items-center justify-center
              transition-all duration-200
              ${canLeft
                ? "opacity-90 hover:opacity-100 hover:bg-foreground hover:text-white hover:border-foreground hover:scale-110 cursor-pointer active:scale-95"
                : "opacity-30 cursor-not-allowed"
              }
            `}
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
          </button>

          {/* → Arrow */}
          <button
            onClick={() => slide("right")}
            disabled={!canRight}
            aria-label="Scroll right"
            className={`
              absolute top-1/2 -translate-y-[calc(50%+16px)] z-30
              right-2 md:-right-5 lg:-right-6
              w-10 h-10 md:w-12 md:h-12
              rounded-full bg-white shadow-lg border border-gray-200
              flex items-center justify-center
              transition-all duration-200
              ${canRight
                ? "opacity-90 hover:opacity-100 hover:bg-foreground hover:text-white hover:border-foreground hover:scale-110 cursor-pointer active:scale-95"
                : "opacity-30 cursor-not-allowed"
              }
            `}
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
          </button>

          {/* ── Track with overflow hidden ────────────────────────── */}
          <div className="overflow-hidden">
            <div
              className="flex select-none"
              style={{
                gap: `${GAP}px`,
                transform: `translateX(calc(${translatePercent}% + ${translatePx}px))`,
                transition: isSwiping ? "none" : "transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)",
                cursor: isDragging.current ? "grabbing" : "grab",
              }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              onClickCapture={onClickCapture}
            >
              {products.map((product) => (
                <a
                  key={product.id}
                  href={`/koleksionet/${product.collectionSlug}/${product.slug}`}
                  draggable={false}
                  className="group shrink-0"
                  style={{
                    width: `calc((100% - ${(visibleCount - 1) * GAP}px) / ${visibleCount})`,
                  }}
                >
                  <div className="aspect-square overflow-hidden bg-secondary rounded-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      draggable={false}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <p
                    className="mt-3 text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2"
                    style={{ textTransform: "none", letterSpacing: "normal" }}
                  >
                    {toTitleCase(product.name)}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Progress bar ────────────────────────────────────────── */}
        {maxIndex > 0 && (
          <div className="mt-8 mx-auto max-w-md">
            <div className="h-[3px] bg-muted relative overflow-hidden rounded-full">
              <div
                className="absolute top-0 h-full bg-primary rounded-full"
                style={{
                  width: `${thumbW}%`,
                  left: `${progress * (100 - thumbW)}%`,
                  transition: "left 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SuggestionsSection;
