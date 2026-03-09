import { Link } from "react-router-dom";
import SlugLink from "@/components/SlugLink";
import logo from "@/assets/egjeu-logo.png";
import { useNavMenusByLocation } from "@/hooks/useNavMenus";

const defaultFooterLinks: Record<string, { label: string; href: string }[]> = {
  Products: [
    { label: "Dhomë Gjumi", href: "#" },
    { label: "Tualet", href: "#" },
    { label: "Dyshek", href: "#" },
    { label: "Restorant", href: "#" },
    { label: "Pishinë", href: "#" },
    { label: "Spa", href: "#" },
    { label: "Shampoo & Amenities", href: "#" },
  ],
  Company: [],
  Support: [],
};

const SiteFooter = () => {
  const { data: col1 } = useNavMenusByLocation("footer_col1");
  const { data: col2 } = useNavMenusByLocation("footer_col2");

  const companyLinks = col1?.map(m => ({ label: m.label, href: m.href })) ?? defaultFooterLinks.Company;
  const supportLinks = col2?.map(m => ({ label: m.label, href: m.href })) ?? defaultFooterLinks.Support;

  const footerColumns = [
    { title: "Products", links: defaultFooterLinks.Products },
    { title: "Company", links: companyLinks },
    { title: "Support", links: supportLinks },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/"><img src={logo} alt="EGJEU" className="h-10 mb-4 brightness-0 invert" /></Link>
            <p className="text-xs text-primary-foreground/70 leading-relaxed">Për një jetë më të mirë...</p>
            <div className="mt-6 text-xs text-primary-foreground/70 space-y-1">
              <p>+355 69 000 0000</p>
              <p>info@egjeu.al</p>
              <p>Tiranë, Shqipëri</p>
            </div>
          </div>
          {footerColumns.map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-xs tracking-wide-brand font-semibold mb-4 uppercase">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <SlugLink to={link.href} className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors normal-case tracking-normal">{link.label}</SlugLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container py-4 text-center">
          <p className="text-[10px] text-primary-foreground/50 tracking-brand">EGJEU © {new Date().getFullYear()}. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
