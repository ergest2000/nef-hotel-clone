import { ChevronDown } from "lucide-react";

const clients = [
  "ROYAL OLYMPIC", "STELLA PALACE", "SUN BEACH", "THE SYNTOPIA",
  "WHITE OLIVE", "SEA SIDE", "XENO HOTELS", "THEOXENIA", "ROCHAR",
  "MARIS HOTEL", "BLUE LAGOON", "PORTO VIEW",
];

const ClientsCarousel = () => {
  return (
    <section className="py-16 md:py-24 bg-warm-gray">
      <div className="text-center mb-12">
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light">
          SEE OUR CLIENTS
        </h2>
        <ChevronDown className="mx-auto mt-4 text-muted-foreground" size={24} />
      </div>

      {/* Desktop: grid 9 per row, Mobile: 3 per row */}
      <div className="container">
        <div className="grid grid-cols-3 md:grid-cols-9 gap-6 md:gap-8">
          {clients.map((client, i) => (
            <div
              key={i}
              className="flex items-center justify-center p-4 bg-background border border-border hover:shadow-md transition-shadow"
            >
              <span className="text-[10px] md:text-xs tracking-brand text-muted-foreground text-center font-semibold">
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
