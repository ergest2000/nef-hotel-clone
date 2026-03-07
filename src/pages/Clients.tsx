import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Building2 } from "lucide-react";

const clients = [
  "AKS Hotels", "Aldemar Resorts", "Amalia Hotels", "Anatolia Hotels", "Anek Lines", "Angsana",
  "Aqua Bay Hotel", "Aqua Suites Hotel", "Art Maisons", "Athens Capital Hotel", "Atlantica", "Belvedere",
  "Bohème Suites & Spa", "CBH Hotels", "Contessino", "Creta Palace", "Danai Beach Resort",
  "Diamond Deluxe Hotel", "Elounda Peninsula", "Elivi Hotels", "Elysium", "Grecotel",
  "Heritage Hill Hotel", "InterContinental", "King George", "KBH Hotels", "Langley Hotels",
  "Lorvenn", "The Luxury Hotels", "Mayor Hotels", "Messonghi Beach", "Minos Mare Royal",
  "Neptune Hotels", "Onoma Hotel", "Olympic Palace", "Petit Palace", "Philoxenia",
  "Pomegranate Wellness Spa", "Porto Palace", "Porto Angel", "Port Royal", "Rhodos Palladium",
  "Rochari Hotel", "Royal Olympic", "Stella Hotels", "Sun Beach Resort", "The Syntopia",
  "Theoxenia", "White Olive", "Wyndham Grand", "Sea Side Resort", "Xenos Hotels",
];

const Clients = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-warm-gray">
        <div className="container text-center">
          <h1 className="text-3xl md:text-5xl font-light tracking-brand text-foreground mb-4">
            Clients
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto tracking-wide">
            Customer trust and satisfaction is our primary goal
          </p>
        </div>
      </section>

      {/* Client Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
            {clients.map((name) => (
              <div
                key={name}
                className="flex flex-col items-center justify-center gap-3 p-6 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-background"
              >
                <Building2 size={32} className="text-muted-foreground/40" />
                <span className="text-[11px] md:text-xs tracking-brand text-center text-muted-foreground uppercase leading-tight">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Clients;
