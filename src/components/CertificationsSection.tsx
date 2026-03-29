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
        <div className="flex flex-col md:flex-row items-center justify-center">
          {certs.map((cert, i) => (
            <div key={cert.id} className="flex items-center">
              {i > 0 && (
                <div className="hidden md:block w-px h-16 bg-border/60 mx-10" />
              )}
              {i > 0 && (
                <div className="md:hidden w-16 h-px bg-border/60 my-6" />
              )}
              <div className="flex items-center justify-center px-6 py-3">
                {cert.logo_url ? (
                  <img src={cert.logo_url} alt={cert.name} className="h-[60px] md:h-[70px] w-auto object-contain" />
                ) : (
                  <span className="text-sm tracking-[0.15em] text-muted-foreground font-semibold uppercase">{cert.name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
