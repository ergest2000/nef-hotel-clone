import { Link } from "react-router-dom";
import logo from "@/assets/egjeu-logo.png";

const footerLinks = {
  "Products": [
    { label: "Dhomë Gjumi", href: "#" },
    { label: "Tualet", href: "#" },
    { label: "Dyshek", href: "#" },
    { label: "Restorant", href: "#" },
    { label: "Pishinë", href: "#" },
    { label: "Spa", href: "#" },
    { label: "Shampoo & Amenities", href: "#" },
  ],
  "Company": [
    { label: "About Us", href: "/company" },
    { label: "Our Clients", href: "/clients" },
    { label: "Certifications", href: "/#certifications" },
    { label: "Blog", href: "/blog" },
    { label: "Catalogue", href: "#" },
    { label: "Tailor Made", href: "/tailor-made" },
  ],
  "Support": [
    { label: "Contact", href: "/contact" },
    { label: "Shipping", href: "#" },
    { label: "Payment Terms", href: "#" },
    { label: "Terms of Use", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
};

const SiteFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/">
              <img src={logo} alt="EGJEU" className="h-10 mb-4 brightness-0 invert" />
            </Link>
            <p className="text-xs text-primary-foreground/70 leading-relaxed">
              Për një jetë më të mirë...
            </p>
            <div className="mt-6 text-xs text-primary-foreground/70 space-y-1">
              <p>+355 69 000 0000</p>
              <p>info@egjeu.al</p>
              <p>Tiranë, Shqipëri</p>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs tracking-wide-brand font-semibold mb-4 uppercase">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors normal-case tracking-normal"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container py-4 text-center">
          <p className="text-[10px] text-primary-foreground/50 tracking-brand">
            EGJEU © {new Date().getFullYear()}. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
