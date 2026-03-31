import { getContentValue } from "@/hooks/useCms";
import { useManagedLogos } from "@/hooks/useManagedLogos";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const CertificationsSection = ({ content }: { content?: SiteContent[] }) => {
  const title = getContentValue(content, "certifications", "title", "CERTIFICATIONS");
  const { data: logos } = useManagedLogos("certifications");
  const certs = logos?.filter((l) => l.visible) ?? [];

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

        {/* Mobile: 3 per row grid, large logos */}
        <div className="md:hidden grid grid-cols-3 items-center justify-items-center gap-2 px-2">
          {certs.map((cert) => (
            <div key={cert.id} className="flex items-center justify-center">
              {cert.logo_url ? (
                <img src={cert.logo_url} alt={cert.name} className="w-full h-auto object-contain" />
              ) : (
                <span className="text-[10px] tracking-[0.15em] text-muted-foreground font-semibold uppercase text-center">{cert.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
