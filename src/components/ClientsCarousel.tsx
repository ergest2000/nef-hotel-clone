import { allClients } from "@/data/clients";

const ClientsCarousel = () => {
  // Duplicate for infinite scroll effect
  const doubledClients = [...allClients, ...allClients];

  return (
    <section className="py-16 md:py-24 bg-warm-gray overflow-hidden">
      <div className="text-center mb-12">
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light">
          SEE OUR CLIENTS
        </h2>
      </div>

      {/* Scrolling carousel - responsive */}
      <div className="relative w-full overflow-hidden">
        {/* Row 1 */}
        <div className="flex animate-scroll-clients w-max mb-4">
          {doubledClients.map((client, i) => (
            <div
              key={`r1-${i}`}
              className="flex items-center justify-center px-6 md:px-10 py-4 mx-2 bg-background border border-border shrink-0 hover:shadow-md transition-shadow"
            >
              <span className="text-[9px] md:text-[11px] tracking-brand text-muted-foreground text-center font-semibold uppercase whitespace-nowrap">
                {client}
              </span>
            </div>
          ))}
        </div>
        {/* Row 2 - reverse direction */}
        <div className="flex animate-scroll-clients-reverse w-max">
          {[...doubledClients].reverse().map((client, i) => (
            <div
              key={`r2-${i}`}
              className="flex items-center justify-center px-6 md:px-10 py-4 mx-2 bg-background border border-border shrink-0 hover:shadow-md transition-shadow"
            >
              <span className="text-[9px] md:text-[11px] tracking-brand text-muted-foreground text-center font-semibold uppercase whitespace-nowrap">
                {client}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientsCarousel;
