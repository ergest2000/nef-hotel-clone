import { getContentValue } from "@/hooks/useCms";
import { useManagedLogos } from "@/hooks/useManagedLogos";
import { Building2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const ClientsCarousel = ({ content }: { content?: SiteContent[] }) => {
  const title = getContentValue(content, "clients", "title", "SEE OUR CLIENTS");
  const { data: logos } = useManagedLogos("clients");

  const clients = logos?.filter((l) => l.visible).map((l) => ({ name: l.name, logo: l.logo_url })) ?? [];
  const doubledClients = [...clients, ...clients];

  if (clients.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-warm-gray overflow-hidden">
      <div className="text-center mb-12">
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light">{title}</h2>
      </div>
      <div className="relative w-full overflow-hidden">
        <div className="flex animate-scroll-clients w-max mb-4">
          {doubledClients.map((client, i) => (
            <div key={`r1-${i}`} className="flex items-center justify-center px-6 md:px-10 py-4 mx-2 bg-background border border-border shrink-0 hover:shadow-md transition-shadow min-w-[140px]">
              {client.logo ? (
                <img src={client.logo} alt={client.name} className="max-h-8 max-w-[100px] object-contain" />
              ) : (
                <span className="text-[9px] md:text-[11px] tracking-brand text-muted-foreground text-center font-semibold uppercase whitespace-nowrap">{client.name}</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex animate-scroll-clients-reverse w-max">
          {[...doubledClients].reverse().map((client, i) => (
            <div key={`r2-${i}`} className="flex items-center justify-center px-6 md:px-10 py-4 mx-2 bg-background border border-border shrink-0 hover:shadow-md transition-shadow min-w-[140px]">
              {client.logo ? (
                <img src={client.logo} alt={client.name} className="max-h-8 max-w-[100px] object-contain" />
              ) : (
                <span className="text-[9px] md:text-[11px] tracking-brand text-muted-foreground text-center font-semibold uppercase whitespace-nowrap">{client.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientsCarousel;
