import { getContentValue } from "@/hooks/useCms";
import { allClients } from "@/data/clients";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const ClientsCarousel = ({ content }: { content?: SiteContent[] }) => {
  const title = getContentValue(content, "clients", "title", "SEE OUR CLIENTS");
  const doubledClients = [...allClients, ...allClients];

  return (
    <section className="py-16 md:py-24 bg-warm-gray overflow-hidden">
      <div className="text-center mb-12">
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light">{title}</h2>
      </div>
      <div className="relative w-full overflow-hidden">
        <div className="flex animate-scroll-clients w-max mb-4">
          {doubledClients.map((client, i) => (
            <div key={`r1-${i}`} className="flex items-center justify-center px-6 md:px-10 py-4 mx-2 bg-background border border-border shrink-0 hover:shadow-md transition-shadow">
              <span className="text-[9px] md:text-[11px] tracking-brand text-muted-foreground text-center font-semibold uppercase whitespace-nowrap">{client}</span>
            </div>
          ))}
        </div>
        <div className="flex animate-scroll-clients-reverse w-max">
          {[...doubledClients].reverse().map((client, i) => (
            <div key={`r2-${i}`} className="flex items-center justify-center px-6 md:px-10 py-4 mx-2 bg-background border border-border shrink-0 hover:shadow-md transition-shadow">
              <span className="text-[9px] md:text-[11px] tracking-brand text-muted-foreground text-center font-semibold uppercase whitespace-nowrap">{client}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientsCarousel;
