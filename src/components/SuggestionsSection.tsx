import { getContentValue } from "@/hooks/useCms";
import catBedroom from "@/assets/cat-bedroom.jpg";
import catBathroom from "@/assets/cat-bathroom.jpg";
import catPool from "@/assets/cat-pool.jpg";
import catSpa from "@/assets/cat-spa.jpg";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const defaultProducts = [
  { key: "prod1", name: "Premium Cotton Sheet Set", category: "Bedroom", image: catBedroom, price: "€45.00" },
  { key: "prod2", name: "Luxury Bath Towel Pack", category: "Bathroom", image: catBathroom, price: "€28.00" },
  { key: "prod3", name: "Pool Towel Collection", category: "Pool", image: catPool, price: "€32.00" },
  { key: "prod4", name: "Spa Robe Deluxe", category: "Spa", image: catSpa, price: "€55.00" },
];

const SuggestionsSection = ({ content }: { content?: SiteContent[] }) => {
  const title = getContentValue(content, "suggestions", "title", "SUGGESTIONS FOR YOU");

  const products = defaultProducts.map((def) => {
    const name = getContentValue(content, "suggestions", `${def.key}_name`, def.name);
    const category = getContentValue(content, "suggestions", `${def.key}_category`, def.category);
    const price = getContentValue(content, "suggestions", `${def.key}_price`, def.price);
    const imageVal = getContentValue(content, "suggestions", `${def.key}_image`, "");
    const image = imageVal && !imageVal.startsWith("/src/") ? imageVal : def.image;
    return { name, category, image, price };
  });

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-12">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <a key={product.name} href="#" className="group">
              <div className="aspect-square overflow-hidden mb-4">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <p className="text-[10px] tracking-brand text-muted-foreground uppercase">{product.category}</p>
              <p className="text-sm text-foreground mt-1 group-hover:text-primary transition-colors">{product.name}</p>
              <p className="text-sm font-semibold text-foreground mt-1">{product.price}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuggestionsSection;
