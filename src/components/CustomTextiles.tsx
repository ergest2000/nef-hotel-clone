import { getContentValue } from "@/hooks/useCms";
import customImg from "@/assets/custom-textiles.jpg";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const CustomTextiles = ({ content }: { content?: SiteContent[] }) => {
  const title = getContentValue(content, "custom-textiles", "title", "CUSTOMIZED TEXTILES");
  const p1 = getContentValue(content, "custom-textiles", "paragraph1", "Discuss the needs of your hotel with our team and we will propose you a complete solution for your business linen. We offer personalized embroidery, custom sizing, and branded packaging for your hotel.");
  const p2 = getContentValue(content, "custom-textiles", "paragraph2", "Our knowledge and experience at your service. Let us help you create the perfect guest experience with tailor-made textile solutions.");
  const ctaText = getContentValue(content, "custom-textiles", "cta_text", "Learn More");
  const ctaLink = getContentValue(content, "custom-textiles", "cta_link", "#");
  const imageVal = getContentValue(content, "custom-textiles", "image", "");
  const image = imageVal && !imageVal.startsWith("/src/") ? imageVal : customImg;

  return (
    <section className="py-16 md:py-24 bg-warm-gray">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div>
            <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light mb-6">{title}</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">{p1}</p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8">{p2}</p>
            <a href={ctaLink} className="hidden md:inline-block px-8 py-3 bg-primary text-primary-foreground text-xs tracking-wide-brand uppercase hover:bg-navy-dark transition-colors">
              {ctaText}
            </a>
          </div>
          <div className="overflow-hidden">
            <img src={image} alt="Custom hotel textiles embroidery" className="w-full h-[300px] md:h-[450px] object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
          <a href={ctaLink} className="md:hidden inline-block px-8 py-3 bg-primary text-primary-foreground text-xs tracking-wide-brand uppercase hover:bg-navy-dark transition-colors text-center">
            {ctaText}
          </a>
        </div>
      </div>
    </section>
  );
};

export default CustomTextiles;
