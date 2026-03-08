import { useState } from "react";
import { getContentValue } from "@/hooks/useCms";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const NewsletterSection = ({ content }: { content?: SiteContent[] }) => {
  const [email, setEmail] = useState("");
  const title = getContentValue(content, "newsletter", "title", "STAY UPDATED");
  const subtitle = getContentValue(content, "newsletter", "subtitle", "Subscribe to our newsletter and never miss an update.");
  const description = getContentValue(content, "newsletter", "description", "Be the first to learn about our offers and our news.");

  return (
    <section className="py-16 md:py-24 bg-newsletter-bg">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl tracking-wide-brand text-primary-foreground font-light mb-3">{title}</h2>
            <p className="text-sm text-primary-foreground/70">{subtitle}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-foreground/80 mb-4">{description}</p>
            <div className="flex gap-0">
              <input
                type="email"
                placeholder="Enter your e-mail address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 text-sm focus:outline-none focus:border-primary-foreground"
              />
              <button className="px-6 py-3 bg-primary-foreground text-primary text-xs tracking-wide-brand uppercase hover:bg-primary-foreground/90 transition-colors">Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
