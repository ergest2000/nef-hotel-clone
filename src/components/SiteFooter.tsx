import { Link } from "react-router-dom";
import SlugLink from "@/components/SlugLink";
import logo from "@/assets/egjeu-logo.png";
import { useNavMenusByLocation } from "@/hooks/useNavMenus";
import { useDesign } from "@/hooks/useDesignSettings";
import { useLanguage } from "@/hooks/useLanguage";

const defaultProductLinks = [
  { label: "Dhomë Gjumi", href: "#" },
  { label: "Tualet", href: "#" },
  { label: "Dyshek", href: "#" },
  { label: "Restorant", href: "#" },
  { label: "Pishinë", href: "#" },
  { label: "Spa", href: "#" },
  { label: "Shampoo & Amenities", href: "#" },
];

const SiteFooter = () => {
  const { data: col1 } = useNavMenusByLocation("footer_col1");
  const { data: col2 } = useNavMenusByLocation("footer_col2");
  const { data: productMenus } = useNavMenusByLocation("footer_products");
  const { settings } = useDesign();
  const { isAl } = useLanguage();

  const productLinks = productMenus?.map(m => ({ label: m.label, href: m.href })) ?? defaultProductLinks;
  const companyLinks = col1?.map(m => ({ label: m.label, href: m.href })) ?? [];
  const supportLinks = col2?.map(m => ({ label: m.label, href: m.href })) ?? [];

  const footerColumns = [
    { title: "Products", links: productLinks },
    { title: "Company", links: companyLinks },
    { title: "Support", links: supportLinks },
  ];

  const description = isAl
    ? (settings.footer_description_al || "Për një jetë më të mirë...")
    : (settings.footer_description_en || "For a better life...");
  const phone = settings.footer_phone || "+355 69 000 0000";
  const email = settings.footer_email || "info@egjeu.al";
  const address = isAl
    ? (settings.footer_address_al || "Tiranë, Shqipëri")
    : (settings.footer_address_en || "Tirana, Albania");
  const copyright = (settings.footer_copyright || "EGJEU © {year}. ALL RIGHTS RESERVED.")
    .replace("{year}", new Date().getFullYear().toString());
  const footerLogo = settings.footer_logo_url || logo;

  // Custom footer colors via inline style
  const bgColor = settings.footer_bg_color;
  const textColor = settings.footer_text_color;
  const footerStyle: React.CSSProperties = {};
  if (bgColor) footerStyle.backgroundColor = `hsl(${bgColor})`;
  if (textColor) footerStyle.color = `hsl(${textColor})`;

  return (
    <footer
      className="bg-primary text-primary-foreground"
      style={footerStyle}
    >
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/">
              <img
                src={footerLogo}
                alt="EGJEU"
                className="h-10 mb-4 brightness-0 invert"
              />
            </Link>
            <p className="text-xs leading-relaxed" style={{ opacity: 0.7 }}>{description}</p>
            <div className="mt-6 text-xs space-y-1" style={{ opacity: 0.7 }}>
              <p>{phone}</p>
              <p>{email}</p>
              <p>{address}</p>
            </div>
          </div>
          {footerColumns.map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-xs tracking-wide-brand font-semibold mb-4 uppercase">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <SlugLink
                      to={link.href}
                      className="text-xs hover:opacity-100 transition-opacity normal-case tracking-normal"
                      style={{ opacity: 0.7 }}
                    >
                      {link.label}
                    </SlugLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="container py-4 text-center">
          <p className="text-[10px] tracking-brand" style={{ opacity: 0.5 }}>{copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
