import { gridClients, carouselClients } from "@/data/clients";

const ClientsCarousel = () => {
  return (
    <section className="py-16 md:py-24 bg-warm-gray overflow-hidden">
      <div className="text-center mb-12">
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light">
          SEE OUR CLIENTS
        </h2>
      </div>

      {/* Grid: 9 per row desktop, 3 per row mobile */}
      <div className="container mb-12">
        <div className="grid grid-cols-3 md:grid-cols-9 gap-4 md:gap-6">
          {gridClients.map((client, i) => (
            <div
              key={i}
              className="flex items-center justify-center p-4 bg-background border border-border hover:shadow-md transition-shadow"
            >
              <span className="text-[9px] md:text-[10px] tracking-brand text-muted-foreground text-center font-semibold uppercase leading-tight">
                {client}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Horizontal scrolling carousel for remaining clients */}
      {carouselClients.length > 0 && (
        <div className="relative w-full overflow-hidden">
          <div className="flex animate-scroll-clients w-max">
            {[...carouselClients, ...carouselClients].map((client, i) => (
              <div
                key={i}
                className="flex items-center justify-center px-8 py-4 mx-3 bg-background border border-border shrink-0"
              >
                <span className="text-[9px] md:text-[10px] tracking-brand text-muted-foreground text-center font-semibold uppercase whitespace-nowrap">
                  {client}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ClientsCarousel;
