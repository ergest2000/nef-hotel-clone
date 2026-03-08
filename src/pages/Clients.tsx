import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Building2 } from "lucide-react";
import { useManagedLogos } from "@/hooks/useManagedLogos";
import { usePageContent, usePageSections, getContentValue } from "@/hooks/useCms";

const Clients = () => {
  const { data: content } = usePageContent("clients", "al");
  const { data: sections } = usePageSections("clients");
  const { data: logos } = useManagedLogos("clients");

  const clients = logos?.filter((l) => l.visible) ?? [];

  const isSectionVisible = (key: string) => {
    if (!sections) return true;
    const s = sections.find((sec) => sec.section_key === key);
    return s ? s.visible : true;
  };

  return (
    <div className="min-h-screen bg-background md:overflow-visible md:h-auto overflow-y-auto h-screen overscroll-none">
      <SiteHeader />

      {isSectionVisible("hero") && (
        <section className="py-16 md:py-24 bg-warm-gray">
          <div className="container text-center">
            <h1 className="text-3xl md:text-5xl font-light tracking-brand text-foreground mb-4">
              {getContentValue(content, "hero", "title", "Clients")}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto tracking-wide">
              {getContentValue(content, "hero", "subtitle", "Customer trust and satisfaction is our primary goal")}
            </p>
          </div>
        </section>
      )}

      {isSectionVisible("grid") && (
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
              {clients.map((client) => (
                <div key={client.id} className="flex flex-col items-center justify-center gap-3 p-6 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-background">
                  {client.logo_url ? (
                    <img src={client.logo_url} alt={client.name} className="max-h-10 max-w-[100px] object-contain" />
                  ) : (
                    <Building2 size={32} className="text-muted-foreground/40" />
                  )}
                  <span className="text-[11px] md:text-xs tracking-brand text-center text-muted-foreground uppercase leading-tight">{client.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
};

export default Clients;
