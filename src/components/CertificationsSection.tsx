import { getContentValue } from "@/hooks/useCms";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const defaultCerts = ["OEKO-TEX®", "ISO 9001", "ISO 14001", "CE Certified", "EU Ecolabel"];

const CertificationsSection = ({ content }: { content?: SiteContent[] }) => {
  const title = getContentValue(content, "certifications", "title", "CERTIFICATIONS");
  const certs = defaultCerts.map((def, i) =>
    getContentValue(content, "certifications", `cert${i + 1}`, def)
  );

  return (
    <section className="py-12 md:py-16 border-t border-border">
      <div className="container">
        <h2 className="text-lg tracking-wide-brand text-foreground font-light text-center mb-8">{title}</h2>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {certs.map((cert) => (
            <div key={cert} className="flex items-center justify-center px-6 py-3 border border-border">
              <span className="text-xs tracking-brand text-muted-foreground font-semibold">{cert}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
