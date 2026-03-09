import { Search, Heart, ShoppingCart, UserPlus, Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import SlugLink from "@/components/SlugLink";
import logo from "@/assets/egjeu-logo.png";
import { useNavMenusByLocation } from "@/hooks/useNavMenus";
import { useLanguage } from "@/hooks/useLanguage";

const productLinks = [
  { label: "Dhomë Gjumi", href: "#" },
  { label: "Spa", href: "#" },
  { label: "Tualet", href: "#" },
  { label: "Pishinë", href: "#" },
  { label: "Dyshek", href: "#" },
  { label: "Shampoo dhe Amenities", href: "#" },
  { label: "Restorant", href: "#" },
];

const SiteHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const { data: headerMenus } = useNavMenusByLocation("header");

  const mainLinks = headerMenus?.map(m => ({ label: m.label, href: m.href })) ?? [
    { label: "About Us", href: "/company" },
    { label: "Our Clients", href: "/clients" },
    { label: "Certifications", href: "/#certifications" },
    { label: "Blog", href: "/blog" },
    { label: "Catalogue", href: "#" },
    { label: "Tailor Made", href: "/tailor-made" },
    { label: "Contact", href: "/contact" },
  ];

  const isAl = lang === "al";

  return (
    <header className="w-full sticky top-0 z-50 bg-background">
      {/* === DESKTOP === */}
      <div className="hidden lg:block">
        <div className="border-b border-border">
          <div className="container flex items-center h-10 gap-4 text-xs tracking-brand">
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setLang("al")} className={`px-1 ${isAl ? "text-foreground font-semibold" : "text-muted-foreground"}`}>AL</button>
              <span className="text-border">|</span>
              <button onClick={() => setLang("en")} className={`px-1 ${!isAl ? "text-foreground font-semibold" : "text-muted-foreground"}`}>EN</button>
            </div>
            <span className="text-muted-foreground shrink-0">
              CONTACT: <strong className="text-foreground">+355 69 000 0000</strong>
            </span>
            <div className="relative flex-1 mx-auto max-w-sm">
              <input type="text" placeholder={isAl ? "Kerko per produkte ketu" : "Search for products here"} className="w-full h-7 pl-3 pr-8 text-xs border border-border bg-background rounded-full focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60 text-center placeholder:text-center" />
              <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-5 shrink-0 ml-auto">
              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><Heart size={14} /> <span>0</span></button>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><ShoppingCart size={14} /> <span>0</span></button>
              <SlugLink to="/register" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><UserPlus size={14} /> <span>{isAl ? "REGJISTROHU / HYR" : "REGISTER / LOGIN"}</span></SlugLink>
            </div>
          </div>
        </div>

        <div className="border-b border-border">
          <div className="container flex items-center h-20 gap-4">
            <Link to="/" className="flex items-center gap-3 shrink-0"><img src={logo} alt="EGJEU" className="h-14 w-auto" /></Link>
            <button className="text-foreground hover:text-primary transition-colors shrink-0" onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}>
              {desktopMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <nav className="flex items-center gap-4 xl:gap-5">
              {productLinks.map((item) => (
                <SlugLink key={item.label} to={item.href} className="text-[10px] xl:text-xs tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase whitespace-nowrap">{item.label}</SlugLink>
              ))}
            </nav>
          </div>
        </div>

        {desktopMenuOpen && (
          <div className="border-b border-border bg-background shadow-sm">
            <div className="container py-6">
              <div className="flex flex-col gap-1">
                {mainLinks.map((item) => (
                  <SlugLink key={item.label} to={item.href} onClick={() => setDesktopMenuOpen(false)} className="text-xs tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase py-2">{item.label}</SlugLink>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* === MOBILE === */}
      <div className="lg:hidden">
        <div className="border-b border-border">
          <div className="container flex items-center justify-between h-14">
            <button className="text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link to="/" className="absolute left-1/2 -translate-x-1/2"><img src={logo} alt="EGJEU" className="h-9 w-auto" /></Link>
            <div className="flex items-center gap-4">
              <button className="text-muted-foreground hover:text-foreground"><Heart size={18} /></button>
              <SlugLink to="/register" className="text-muted-foreground hover:text-foreground"><UserPlus size={18} /></SlugLink>
              <button className="relative text-muted-foreground hover:text-foreground">
                <ShoppingCart size={18} />
                <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
              </button>
            </div>
          </div>
        </div>
        <div className="border-b border-border px-4 py-2">
          <div className="relative w-full">
            <input type="text" inputMode="search" placeholder={isAl ? "Kërko për produkte këtu..." : "Search for products here..."} className="w-full h-11 pl-4 pr-12 text-[16px] border border-border bg-background rounded-full focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50" />
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-b border-border bg-background">
            <div className="container py-3 flex flex-col gap-1">
              <button onClick={() => setMobileProductsOpen(!mobileProductsOpen)} className="flex items-center justify-between text-sm tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase py-2.5 border-b border-border">
                <span>{isAl ? "Produkte" : "Products"}</span>
                {mobileProductsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {mobileProductsOpen && (
                <div className="flex flex-col gap-1 pl-4">
                  {productLinks.map((item) => (
                    <SlugLink key={item.label} to={item.href} onClick={() => { setMobileMenuOpen(false); setMobileProductsOpen(false); }} className="text-sm tracking-brand text-muted-foreground/80 hover:text-primary transition-colors uppercase py-2 border-b border-border/50 last:border-b-0">{item.label}</SlugLink>
                  ))}
                </div>
              )}
              {mainLinks.map((item) => (
                <SlugLink key={item.label} to={item.href} onClick={() => setMobileMenuOpen(false)} className="text-sm tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase py-2.5 border-b border-border last:border-b-0">{item.label}</SlugLink>
              ))}
              <div className="flex items-center gap-2 pt-3 text-xs text-muted-foreground">
                <button onClick={() => setLang("al")} className={isAl ? "font-semibold text-foreground" : ""}>AL</button>
                <span>|</span>
                <button onClick={() => setLang("en")} className={!isAl ? "font-semibold text-foreground" : ""}>EN</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default SiteHeader;
