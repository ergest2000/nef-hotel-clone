import { useState } from "react";
import { getContentValue } from "@/hooks/useCms";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const NewsletterSection = ({ content }: { content?: SiteContent[] }) => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const title = getContentValue(content, "newsletter", "title", "STAY UPDATED");
  const subtitle = getContentValue(content, "newsletter", "subtitle", "Subscribe to our newsletter and never miss an update.");
  const description = getContentValue(content, "newsletter", "description", "Be the first to learn about our offers and our news.");

  const handleSubscribe = async () => {
    if (!email) return;
    try {
      await supabase.from("registrations").insert({
        data: {
          type: "newsletter",
          email,
        },
      });
      toast({ title: "Subscribed!", description: "You'll receive our latest updates." });
      setEmail("");
    } catch {
      toast({ title: "Error", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <section className="py-12 md:py-24 bg-newsletter-bg">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-xl md:text-3xl tracking-wide-brand text-primary-foreground font-light mb-2 md:mb-3">{title}</h2>
            <p className="text-xs md:text-sm text-primary-foreground/70">{subtitle}</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs md:text-sm text-primary-foreground/80 mb-3 md:mb-4">{description}</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <input
                type="email"
                placeholder="Enter your e-mail address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded px-4 py-3 bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 text-sm focus:outline-none focus:border-primary-foreground"
              />
              <button type="button" onClick={handleSubscribe} className="rounded px-6 py-3 bg-primary-foreground text-primary text-xs tracking-wide-brand uppercase hover:bg-primary-foreground/90 transition-colors">Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
