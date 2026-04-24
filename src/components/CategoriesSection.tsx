import { getContentValue } from "@/hooks/useCms";
import { useHomepageCategories } from "@/hooks/useHomepageCategories";
import { useCollections } from "@/hooks/useCollections";
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
  const { data: collections } = useCollections();

  // Përshtat fallback sipas titullit
  const pickFallback = (title: string) => {
    const t = (title || "").toLowerCase();
    if (t.includes("gjumi") || t.includes("bedroom")) return catBedroom;
    if (t.includes("banjo") || t.includes("bathroom") || t.includes("tualet")) return catBathroom;
    if (t.includes("dyshek") || t.includes("mattress")) return catMattresses;
    if (t.includes("restorant") || t.includes("dining")) return catDining;
    if (t.includes("pishin") || t.includes("pool")) return catPool;
    if (t.includes("spa")) return catSpa;
    if (t.includes("shampo") || t.includes("amenit")) return catAmenities;
    if (t.includes("pastr") || t.includes("clean")) return catClean;
    return catBedroom;
  };

  // Gjej imazhin e koleksionit të lidhur - kërko sipas link_url, slug të titullit, ose titullit
  const findCollectionImage = (categoryTitle: string, linkUrl?: string | null): string | null => {
    if (!collections?.length) return null;

    // 1) Kërko sipas link_url p.sh. "/koleksionet/spa" → collection me slug "spa"
    if (linkUrl) {
      const match = linkUrl.match(/\/koleksionet\/([^/?#]+)/);
      if (match) {
        const slug = match[1].toLowerCase();
        const col = collections.find((c) => c.slug?.toLowerCase() === slug);
        if (col?.image_url?.trim()) return col.image_url;
      }
    }

    // 2) Kërko sipas titullit (p.sh. "SPA" → collection me title_al "SPA" ose slug "spa")
    if (categoryTitle) {
      const normalizedTitle = categoryTitle.toLowerCase().trim();
      const col = collections.find((c) => {
        const titleAl = (c.title_al || "").toLowerCase().trim();
        const titleEn = (c.title_en || "").toLowerCase().trim();
        const slug = (c.slug || "").toLowerCase().trim();
        return titleAl === normalizedTitle ||
               titleEn === normalizedTitle ||
               slug === normalizedTitle ||
               slug === normalizedTitle.replace(/\s+/g, "-");
      });
      if (col?.image_url?.trim()) return col.image_url;
    }

    return null;
  };

  // Prioritet i të dhënave:
  // 1) Nëse ka kategori te "homepage_categories", përdori ato
  // 2) Përndryshe, përdor koleksionet top-level (parent_id == null) që kanë image_url
  // 3) Si fallback i fundit, hardcoded defaults
  let categories: Array<{ name: string; image: string; fallback: string; link: string; id: string }> = [];

  if (dynamicCategories?.length) {
    categories = dynamicCategories.map((c) => {
      const name = lang === "en" ? (c.title_en || c.title_al) : (c.title_al || c.title_en);
      const ownImage = c.image_url && c.image_url.trim() ? c.image_url : null;
      const collectionImage = findCollectionImage(name, c.link_url);
      const finalImage = ownImage || collectionImage || pickFallback(name);
      return {
        name,
        image: finalImage,
        fallback: pickFallback(name),
        link: c.link_url || "#",
        id: c.id,
      };
    });
  } else if (collections?.length) {
    // Përdor koleksionet top-level (pa parent) që kanë image_url
    const topLevel = collections.filter((c) => !c.parent_id && c.visible !== false);
    categories = topLevel.map((c) => {
      const name = lang === "en" ? (c.title_en || c.title_al || c.slug) : (c.title_al || c.title_en || c.slug);
      return {
        name: name || c.slug,
        image: c.image_url && c.image_url.trim() ? c.image_url : pickFallback(name || c.slug),
        fallback: pickFallback(name || c.slug),
        link: `/koleksionet/${c.slug}`,
        id: c.id,
      };
    });
  } else {
    categories = defaultCategories.map((def) => ({
      name: def.name,
      image: def.image,
      fallback: def.image,
      link: "#",
      id: def.key,
    }));
  }

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
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== cat.fallback) img.src = cat.fallback;
                  }}
                />
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
