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
        <h2 className="text-lg tracking-wide-brand text-foreground font-light text-center mb-8">{title}</h2>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {certs.map((cert) => (
            <div key={cert.id} className="flex items-center justify-center px-6 py-3 border border-border">
              {cert.logo_url ? (
                <img src={cert.logo_url} alt={cert.name} className="max-h-10 max-w-[120px] object-contain" />
              ) : (
                <span className="text-xs tracking-brand text-muted-foreground font-semibold">{cert.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
