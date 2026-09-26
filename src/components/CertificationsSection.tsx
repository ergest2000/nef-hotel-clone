import { useEffect, useRef, useState } from "react";
import { getContentValue } from "@/hooks/useCms";
import { useManagedLogos } from "@/hooks/useManagedLogos";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

// Sa më e ngadaltë se "Klientet tanë" (0.6 = 60% e shpejtësisë së tyre)
const SPEED_FACTOR = 0.6;
// Shpejtësia rezervë (px/sek) nëse slider-i i klientëve nuk ndodhet në faqe
const FALLBACK_SPEED = 25;
// Kohëzgjatja e animacionit te ClientsCarousel (duhet të përputhet me index.css)
const CLIENTS_DURATION_S = 160;

const CertificationsSection = ({ content }: { content?: SiteContent[] }) => {
  const title = getContentValue(content, "certifications", "title", "CERTIFICATIONS");
  const { data: logos } = useManagedLogos("certifications");
  const certs = logos?.filter((l) => l.visible) ?? [];

  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [repeat, setRepeat] = useState(1);
  const [duration, setDuration] = useState(60);

  useEffect(() => {
    const container = containerRef.current;
    const group = groupRef.current;
    if (!container || !group || certs.length === 0) return;

    const measure = () => {
      const groupWidth = group.offsetWidth;
      const containerWidth = container.offsetWidth;
      if (!groupWidth) return;

      // Sigurohu që një grup mbush të paktën gjithë gjerësinë e ekranit
      const singleSetWidth = groupWidth / repeat;
      const needed = Math.max(1, Math.ceil(containerWidth / singleSetWidth));
      if (needed !== repeat) {
        setRepeat(needed);
        return;
      }

      // Llogarit shpejtësinë e "Klientet tanë" dhe bëje më të ngadaltë
      let speed = FALLBACK_SPEED;
      const clientsTrack = document.querySelector<HTMLElement>(".animate-scroll-clients");
      if (clientsTrack?.offsetWidth) {
        speed = (clientsTrack.offsetWidth / 2 / CLIENTS_DURATION_S) * SPEED_FACTOR;
      }
      setDuration(Math.max(10, groupWidth / speed));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    ro.observe(group);
    return () => ro.disconnect();
  }, [certs.length, repeat]);

  if (certs.length === 0) return null;

  const items = Array.from({ length: repeat }, () => certs).flat();

  const renderGroup = (keyPrefix: string, ref?: React.Ref<HTMLDivElement>, hidden = false) => (
    <div ref={ref} className="flex items-center shrink-0" aria-hidden={hidden || undefined}>
      {items.map((cert, i) => (
        <div key={`${keyPrefix}-${cert.id}-${i}`} className="flex items-center shrink-0">
          <div className="w-px h-12 md:h-16 bg-border/60" />
          <div className="flex items-center justify-center px-6 md:px-10 lg:px-12 py-3">
            {cert.logo_url ? (
              <img
                src={cert.logo_url}
                alt={hidden ? "" : cert.name}
                className="h-[60px] md:h-[80px] lg:h-[100px] w-auto max-w-[140px] md:max-w-[180px] object-contain"
                draggable={false}
              />
            ) : (
              <span className="text-xs md:text-sm tracking-[0.15em] text-muted-foreground font-semibold uppercase whitespace-nowrap">
                {cert.name}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="py-12 md:py-16 border-t border-border overflow-hidden">
      <div className="container">
        <h2 className="text-lg md:text-xl tracking-[0.25em] uppercase font-light text-foreground text-center mb-10">{title}</h2>
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div
          className="flex w-max hover:[animation-play-state:paused]"
          style={{ animation: `scroll-clients ${duration}s linear infinite` }}
        >
          {renderGroup("a", groupRef)}
          {renderGroup("b", undefined, true)}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
