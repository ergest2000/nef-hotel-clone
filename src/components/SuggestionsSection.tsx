import { useSuggestedProductsFull } from "@/hooks/useHomepageSuggestions";
import { useLanguage } from "@/hooks/useLanguage";
import { getContentValue } from "@/hooks/useCms";
import catBedroom from "@/assets/cat-bedroom.jpg";
import catBathroom from "@/assets/cat-bathroom.jpg";
import catPool from "@/assets/cat-pool.jpg";
import catSpa from "@/assets/cat-spa.jpg";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const defaultProducts = [
  { key: "prod1", name: "Premium Cotton Sheet Set", category: "Bedroom", image: catBedroom },
  { key: "prod2", name: "Luxury Bath Towel Pack", category: "Bathroom", image: catBathroom },
  { key: "prod3", name: "Pool Towel Collection", category: "Pool", image: catPool },
  { key: "prod4", name: "Spa Robe Deluxe", category: "Spa", image: catSpa },
];

const SuggestionsSection = ({ content }: { content?: SiteContent[] }) => {
  const title = getContentValue(content, "suggestions", "title", "SUGGESTIONS FOR YOU");
  const { lang } = useLanguage();
  const { data: dynamicProducts } = useSuggestedProductsFull();

  // Use dynamic products if available, fallback to defaults
  const products = dynamicProducts?.length
    ? dynamicProducts.map((p: any) => ({
        name: lang === "en" ? (p.title_en || p.title_al) : (p.title_al || p.title_en),
        image: p.image_url || catBedroom,
        id: p.id,
        collectionSlug: p.collectionSlug || "all",
      }))
    : defaultProducts.map((def) => ({
        name: def.name,
        image: def.image,
        id: def.key,
        collectionSlug: "all",
      }));

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-12">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <a key={product.id} href={`/koleksionet/${product.collectionSlug}/${product.id}`} className="group">
              <div className="aspect-square overflow-hidden mb-4">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <p className="text-sm text-foreground mt-1 group-hover:text-primary transition-colors">{product.name}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuggestionsSection;
