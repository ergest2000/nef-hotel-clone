import { Search, Heart, ShoppingCart, UserPlus, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/egjeu-logo.png";

const SiteHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [lang, setLang] = useState<"AL" | "EN">("AL");

  const navLinks = [
    { label: "Bedroom", href: "#" },
    { label: "Bathroom", href: "#" },
    { label: "Mattresses", href: "#" },
    { label: "Dining", href: "#" },
    { label: "Pool", href: "#" },
    { label: "Spa", href: "#" },
    { label: "Amenities", href: "#" },
    { label: "Clean & Fresh", href: "#" },
    { label: "Company", href: "/company" },
    { label: "Clients", href: "/clients" },
    { label: "Tailor Made", href: "/tailor-made" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="w-full">
      {/* === DESKTOP === */}
      <div className="hidden lg:block">
        {/* Top bar: AL|EN | SEARCH | CONTACT | REGISTER/LOGIN */}
        <div className="border-b border-border">
          <div className="container flex items-center h-10 gap-4 text-xs tracking-brand">
            {/* Language */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setLang("AL")}
                className={`px-1 ${lang === "AL" ? "text-foreground font-semibold" : "text-muted-foreground"}`}
              >
                AL
              </button>
              <span className="text-border">|</span>
              <button
                onClick={() => setLang("EN")}
                className={`px-1 ${lang === "EN" ? "text-foreground font-semibold" : "text-muted-foreground"}`}
              >
                EN
              </button>
            </div>

            {/* Contact - left side after language */}
            <span className="text-muted-foreground shrink-0">
              CONTACT: <strong className="text-foreground">+355 69 000 0000</strong>
            </span>

            {/* Search - centered */}
            <div className="relative flex-1 mx-auto max-w-sm">
              <input
                type="text"
                placeholder="Kerko per produkte ketu"
                className="w-full h-7 pl-3 pr-8 text-xs border border-border bg-background rounded-full focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60 text-center placeholder:text-center"
              />
              <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-5 shrink-0 ml-auto">
              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <Heart size={14} /> <span>0</span>
              </button>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <ShoppingCart size={14} /> <span>0</span>
              </button>
              <Link to="/register" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <UserPlus size={14} /> <span>REGISTER / LOGIN</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Logo + Hamburger Nav */}
        <div className="border-b border-border">
          <div className="container flex items-center h-20 gap-6">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img src={logo} alt="EGJEU" className="h-14 w-auto" />
            </Link>
            <button
              className="text-foreground hover:text-primary transition-colors"
              onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
            >
              {desktopMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Desktop dropdown menu */}
        {desktopMenuOpen && (
          <div className="border-b border-border bg-background shadow-sm">
            <div className="container py-4">
              <div className="grid grid-cols-4 gap-x-8 gap-y-2">
                {navLinks.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setDesktopMenuOpen(false)}
                    className="text-xs tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase py-2 border-b border-border"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* === MOBILE === */}
      <div className="lg:hidden">
        {/* Top bar: hamburger + logo + icons */}
        <div className="border-b border-border">
          <div className="container flex items-center justify-between h-14">
            <button className="text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <img src={logo} alt="EGJEU" className="h-9 w-auto" />
            </Link>
            <div className="flex items-center gap-4">
              <button className="text-muted-foreground hover:text-foreground"><Heart size={18} /></button>
              <Link to="/register" className="text-muted-foreground hover:text-foreground"><UserPlus size={18} /></Link>
              <button className="relative text-muted-foreground hover:text-foreground">
                <ShoppingCart size={18} />
                <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search bar - always visible below logo */}
        <div className="border-b border-border px-4 py-2">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Kërko për produkte këtu..."
              className="w-full h-11 pl-4 pr-12 text-sm border border-border bg-background rounded-full focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
            />
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-background">
            <div className="container py-3 flex flex-col gap-1">
              {navLinks.filter(item => item.href !== "#").map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase py-2.5 border-b border-border last:border-b-0"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center gap-2 pt-3 text-xs text-muted-foreground">
                <button onClick={() => setLang("AL")} className={lang === "AL" ? "font-semibold text-foreground" : ""}>AL</button>
                <span>|</span>
                <button onClick={() => setLang("EN")} className={lang === "EN" ? "font-semibold text-foreground" : ""}>EN</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default SiteHeader;
