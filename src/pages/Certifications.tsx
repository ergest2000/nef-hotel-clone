import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { getContentValue } from "@/hooks/useCms";
import { useManagedLogos } from "@/hooks/useManagedLogos";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const CertificationsSection = ({ content }: { content?: SiteContent[] }) => {
  const title = getContentValue(content, "certifications", "title", "CERTIFICATIONS");
  const { data: logos } = useManagedLogos("certifications");
  const certs = logos?.filter((l) => l.visible) ?? [];

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    var timer = setInterval(function () {
      emblaApi.scrollNext();
    }, 3000);
    return function () { clearInterval(timer); };
  }, [emblaApi]);

  return (
    <section className="py-12 md:py-16 border-t border-border">
      <div className="container">
        <h2 className="text-lg md:text-xl tracking-[0.25em] uppercase font-light text-foreground text-center mb-10">{title}</h2>

        {/* Desktop: flex row with dividers */}
        <div className="hidden md:flex items-center justify-center">
          {certs.map((cert, i) => (
            <div key={cert.id} className="flex items-center">
              {i > 0 && <div className="w-px h-16 bg-border/60 mx-10" />}
              <div className="flex items-center justify-center px-6 py-3">
                {cert.logo_url ? (
                  <img src={cert.logo_url} alt={cert.name} className="h-[100px] w-auto object-contain" />
                ) : (
                  <span className="text-sm tracking-[0.15em] text-muted-foreground font-semibold uppercase">{cert.name}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Embla carousel — 1 per slide, large logos */}
        <div className="md:hidden">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {certs.map((cert) => (
                <div key={cert.id} className="flex-[0_0_100%] min-w-0 flex items-center justify-center py-6 px-8">
                  {cert.logo_url ? (
                    <img src={cert.logo_url} alt={cert.name} className="h-[130px] w-auto object-contain max-w-[80%]" />
                  ) : (
                    <span className="text-sm tracking-[0.15em] text-muted-foreground font-semibold uppercase text-center">{cert.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          {certs.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {certs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={"w-2 h-2 rounded-full transition-colors " + (i === selectedIndex ? "bg-primary" : "bg-border")}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
