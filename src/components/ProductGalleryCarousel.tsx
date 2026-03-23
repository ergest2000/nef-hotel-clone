import { useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGalleryImages } from "@/hooks/useGalleryImages";

import galleryTowels1 from "@/assets/gallery-towels-1.jpg";
import galleryBedlinen1 from "@/assets/gallery-bedlinen-1.jpg";
import galleryEmbroidery1 from "@/assets/gallery-embroidery-1.jpg";
import gallerySpa1 from "@/assets/gallery-spa-1.jpg";
import galleryFabric1 from "@/assets/gallery-fabric-1.jpg";
import galleryTowels2 from "@/assets/gallery-towels-2.jpg";
import galleryBedlinen2 from "@/assets/gallery-bedlinen-2.jpg";
import galleryEmbroidery2 from "@/assets/gallery-embroidery-2.jpg";
import gallerySpa2 from "@/assets/gallery-spa-2.jpg";
import galleryDining1 from "@/assets/gallery-dining-1.jpg";

const defaultGallery = [
  { src: galleryTowels1, alt: "Luxury hotel towels" },
  { src: galleryBedlinen1, alt: "Premium hotel bed linen" },
  { src: galleryEmbroidery1, alt: "Embroidered hotel pillowcase" },
  { src: gallerySpa1, alt: "Spa towels and textiles" },
  { src: galleryFabric1, alt: "Premium hotel fabric" },
  { src: galleryTowels2, alt: "Pool towels with hotel logo" },
  { src: galleryBedlinen2, alt: "Hotel duvet cover detail" },
  { src: galleryEmbroidery2, alt: "Gold monogram embroidery" },
  { src: gallerySpa2, alt: "Luxury spa amenities" },
  { src: galleryDining1, alt: "Restaurant table linen" },
];

const ProductGalleryCarousel = () => {
  const { data: dynamicImages } = useGalleryImages("tailor-made");

  const galleryItems = dynamicImages?.length
    ? dynamicImages.map((img) => ({ src: img.image_url, alt: img.alt_text }))
    : defaultGallery;

  const autoplayPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [autoplayPlugin.current]
  );

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-14">
          PRODUCT GALLERY
        </h2>

        <div className="relative group">
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background/80 border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            aria-label="Previous"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background/80 border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            aria-label="Next"
          >
            <ChevronRight size={20} className="text-foreground" />
          </button>

          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {galleryItems.map((item, i) => (
                <div
                  key={i}
                  className="flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] px-2"
                >
                  <div className="overflow-hidden border border-border">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full aspect-[4/3] object-cover hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductGalleryCarousel;
