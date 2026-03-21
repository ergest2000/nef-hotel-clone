import { useState } from "react";
import { Link } from "react-router-dom";
import SlugLink from "@/components/SlugLink";
import logo from "@/assets/egjeu-logo.png";
import { useNavMenusByLocation } from "@/hooks/useNavMenus";
import { useDesign } from "@/hooks/useDesignSettings";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from "lucide-react";

const SiteFooter = () => {
  const { data: col1 } = useNavMenusByLocation("footer_col1");
  const { data: col2 } = useNavMenusByLocation("footer_col2");
  const { data: productMenus } = useNavMenusByLocation("footer_products");
  const { settings } = useDesign();
  const { isAl } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const s = (key: string, fallback = "") => settings[key] || fallback;

  // Newsletter
  const newsletterEnabled = s("footer_newsletter_enabled", "true") === "true";
  const nlTitle = isAl ? s("footer_newsletter_title_al", "NEWSLETTER") : s("footer_newsletter_title_en", "NEWSLETTER");
  const nlSubtitle = isAl
    ? s("footer_newsletter_subtitle_al", "Abonohu në newsletter-in tonë dhe mos humb asnjë përditësim.")
    : s("footer_newsletter_subtitle_en", "Subscribe to our newsletter and never miss an update.");
  const nlDesc = isAl
    ? s("footer_newsletter_desc_al", "Ji i pari që mëson rreth ofertave dhe lajmeve tona.")
    : s("footer_newsletter_desc_en", "Be the first to learn about our offers and our news.");
  const nlBtn = isAl ? s("footer_newsletter_btn_al", "ABONOHU") : s("footer_newsletter_btn_en", "SUBSCRIBE");
  const nlPlaceholder = isAl
    ? s("footer_newsletter_placeholder_al", "Shkruaj adresën e email-it")
    : s("footer_newsletter_placeholder_en", "Enter your email address");

  // Columns
  const col1Title = isAl ? s("footer_col1_title_al", "KOMPANIA") : s("footer_col1_title_en", "COMPANY");
  const col2Title = isAl ? s("footer_col2_title_al", "PRODUKTET") : s("footer_col2_title_en", "PRODUCTS");
  const col3Title = isAl ? s("footer_col3_title_al", "NDIHME") : s("footer_col3_title_en", "SUPPORT");
  const col4Title = isAl ? s("footer_col4_title_al", "KONTAKT") : s("footer_col4_title_en", "CONTACT");

  // Contact
  const phone = s("footer_phone", "+355 69 000 0000");
  const emailAddr = s("footer_email", "info@egjeu.al");
  const address = isAl
    ? s("footer_address_al", "Tiranë, Shqipëri")
    : s("footer_address_en", "Tirana, Albania");

  // Social
  const whatsapp = s("footer_social_whatsapp");
  const facebook = s("footer_social_facebook");
  const instagram = s("footer_social_instagram");

  // Copyright
  const copyright = s("footer_copyright", "EGJEU © {year}. ALL RIGHTS RESERVED.")
    .replace("{year}", new Date().getFullYear().toString());

  // Footer logo & colors
  const footerLogo = s("footer_logo_url") || logo;
  const bgColor = s("footer_bg_color");
  const textColor = s("footer_text_color");
  const footerStyle: React.CSSProperties = {};
  if (bgColor) footerStyle.backgroundColor = `hsl(${bgColor})`;
  if (textColor) footerStyle.color = `hsl(${textColor})`;

  const companyLinks = col1?.map(m => ({ label: m.label, href: m.href })) ?? [];
  const productLinks = productMenus?.map(m => ({ label: m.label, href: m.href })) ?? [];
  const supportLinks = col2?.map(m => ({ label: m.label, href: m.href })) ?? [];

  const handleSubscribe = async () => {
    if (!email) return;
    try {
      await supabase.from("registrations").insert({
        data: { type: "newsletter", email },
      });
      toast({ title: isAl ? "U abonuat!" : "Subscribed!", description: isAl ? "Do merrni përditësimet tona." : "You'll receive our latest updates." });
      setEmail("");
    } catch {
      toast({ title: "Error", description: "Please try again.", variant: "destructive" });
    }
  };

  const socialLinks = [
    { url: whatsapp, icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    )},
    { url: facebook, icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )},
    { url: instagram, icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    )},
  ].filter(s => s.url);

  return (
    <footer className="bg-primary text-primary-foreground" style={footerStyle}>
      {/* Newsletter */}
      {newsletterEnabled && (
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="container py-10 md:py-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
              <div>
                <h2 className="text-lg md:text-xl tracking-[0.25em] font-semibold mb-2">{nlTitle}</h2>
                <p className="text-xs opacity-70">{nlSubtitle}</p>
              </div>
              <div>
                <p className="text-xs opacity-80 mb-3">{nlDesc}</p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder={nlPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-sm placeholder:text-white/50 focus:outline-none focus:border-white/40"
                  />
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    className="px-6 py-3 bg-white/10 border border-white/20 border-l-0 text-xs tracking-[0.2em] font-semibold hover:bg-white/20 transition-colors"
                  >
                    {nlBtn}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main footer */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Column 1 - Company */}
          <div>
            <h4 className="text-xs tracking-[0.25em] font-semibold mb-5 uppercase">{col1Title}</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <SlugLink
                    to={link.href}
                    className="text-xs opacity-60 hover:opacity-100 transition-opacity normal-case tracking-normal"
                  >
                    {link.label}
                  </SlugLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 - Products */}
          <div>
            <h4 className="text-xs tracking-[0.25em] font-semibold mb-5 uppercase">{col2Title}</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <SlugLink
                    to={link.href}
                    className="text-xs opacity-60 hover:opacity-100 transition-opacity normal-case tracking-normal"
                  >
                    {link.label}
                  </SlugLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Support */}
          <div>
            <h4 className="text-xs tracking-[0.25em] font-semibold mb-5 uppercase">{col3Title}</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <SlugLink
                    to={link.href}
                    className="text-xs opacity-60 hover:opacity-100 transition-opacity normal-case tracking-normal"
                  >
                    {link.label}
                  </SlugLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h4 className="text-xs tracking-[0.25em] font-semibold mb-5 uppercase">{col4Title}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Mail size={14} className="opacity-60 shrink-0" />
                <a href={`mailto:${emailAddr}`} className="text-xs opacity-60 hover:opacity-100 transition-opacity">
                  {emailAddr}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="opacity-60 shrink-0" />
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-xs opacity-60 hover:opacity-100 transition-opacity">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={14} className="opacity-60 shrink-0" />
                <span className="text-xs opacity-60">{address}</span>
              </li>
            </ul>

            {/* Social Icons */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3 mt-6">
                {socialLinks.map((social, i) => (
                  <a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-white/10 transition-all"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="container py-4 text-center">
          <p className="text-[10px] tracking-[0.2em] opacity-50">{copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
