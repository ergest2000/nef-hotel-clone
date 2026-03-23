import { getContentValue } from "@/hooks/useCms";
import { useHomepageCategories } from "@/hooks/useHomepageCategories";
import { useLanguage } from "@/hooks/useLanguage";
import catBedroom from "@/assets/cat-bedroom.jpg";
import catBathroom from "@/assets/cat-bathroom.jpg";
import catMattresses from "@/assets/cat-mattresses.jpg";
import catDining from "@/assets/cat-dining.jpg";
import catPool from "@/assets/cat-pool.jpg";
import catSpa from "@/assets/cat-spa.jpg";
import catAmenities from "@/assets/cat-amenities.jpg";
import catClean from "@/assets/cat-clean.jpg";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const defaultCategories = [
  { key: "cat1", name: "Bedroom", image: catBedroom },
  { key: "cat2", name: "Bathroom", image: catBathroom },
  { key: "cat3", name: "Mattresses", image: catMattresses },
  { key: "cat4", name: "Dining", image: catDining },
  { key: "cat5", name: "Pool", image: catPool },
  { key: "cat6", name: "Spa", image: catSpa },
  { key: "cat7", name: "Amenities", image: catAmenities },
  { key: "cat8", name: "Clean & Fresh", image: catClean },
];

const CategoriesSection = ({ content }: { content?: SiteContent[] }) => {
  const title = getContentValue(content, "categories", "title", "KATEGORITË");
  const subtitle = getContentValue(content, "categories", "subtitle", "Koleksioni ynë i hoteleve përfshin kategori produktesh me zgjidhje që mbulojnë çdo nevojë.");
  const { lang } = useLanguage();
  const { data: dynamicCategories } = useHomepageCategories(true);

  const categories = dynamicCategories?.length
    ? dynamicCategories.map((c) => ({
        name: lang === "en" ? (c.title_en || c.title_al) : (c.title_al || c.title_en),
        image: c.image_url || catBedroom,
        link: c.link_url || "#",
        id: c.id,
      }))
    : defaultCategories.map((def) => ({
        name: def.name,
        image: def.image,
        link: "#",
        id: def.key,
      }));

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light">{title}</h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto">{subtitle}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <a key={cat.id} href={cat.link} className="group flex flex-col">
              <div className="relative aspect-square overflow-hidden">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/25 transition-colors" />
              </div>
              <span className="mt-3 text-xs md:text-sm tracking-wide-brand text-foreground font-semibold text-center">
                {cat.name.toUpperCase()}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
