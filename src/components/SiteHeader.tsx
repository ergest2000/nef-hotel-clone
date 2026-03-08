import { Search, Heart, ShoppingCart, UserPlus, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/egjeu-logo.png";

const SiteHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      {/* Top bar */}
      <div className="border-b border-border">
        <div className="container flex items-center justify-between h-10 text-xs tracking-brand">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
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
            <span className="hidden sm:inline text-muted-foreground">
              CONTACT: <strong className="text-foreground">+355 69 000 0000</strong>
            </span>
          </div>
          <div className="flex items-center gap-5">
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Heart size={14} /> <span className="hidden sm:inline">0</span>
            </button>
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingCart size={14} /> <span className="hidden sm:inline">0</span>
            </button>
            <Link to="/register" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <UserPlus size={14} /> <span className="hidden sm:inline">REGISTER / LOGIN</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Logo + Nav + Search bar */}
      <div className="border-b border-border">
        <div className="container flex items-center h-16 md:h-20 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={logo} alt="EGJEU" className="h-10 md:h-14 w-auto" />
          </Link>

          {/* Desktop: nav links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 shrink-0">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-[10px] xl:text-xs tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop: Search bar centered */}
          <div className="hidden lg:flex flex-1 justify-end">
            <div className="relative w-full max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Kerko per produkte ketu"
                className="w-full h-9 pl-9 pr-3 text-xs border border-border bg-background rounded-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden ml-auto">
            <button
              className="text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: search + menu below logo */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-background">
          <div className="container py-4 flex flex-col gap-3">
            {/* Mobile search */}
            <div className="relative w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Kerko per produkte ketu"
                className="w-full h-10 pl-9 pr-3 text-sm border border-border bg-background rounded-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
              />
            </div>
            {/* Mobile nav */}
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase py-2 border-b border-border"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
