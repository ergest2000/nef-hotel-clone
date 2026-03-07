import { Search, Heart, ShoppingCart, UserPlus, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/egjeu-logo.png";

const SiteHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<"AL" | "EN">("AL");

  const menuItems = ["Bedroom", "Bathroom", "Mattresses", "Dining", "Pool", "Spa", "Amenities", "Clean & Fresh"];

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
              <Search size={14} /> <span className="hidden sm:inline">SEARCH</span>
            </button>
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Heart size={14} /> <span className="hidden sm:inline">0</span>
            </button>
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingCart size={14} /> <span className="hidden sm:inline">0</span>
            </button>
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <UserPlus size={14} /> <span className="hidden sm:inline">REGISTER / LOGIN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logo + Menu bar */}
      <div className="border-b border-border">
        <div className="container flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EGJEU" className="h-10 md:h-14 w-auto" />
            <span className="hidden md:inline text-muted-foreground text-sm tracking-brand">hotel collection</span>
          </div>
          
          {/* Desktop menu */}
          <nav className="hidden lg:flex items-center gap-6">
            {menuItems.map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-background">
          <nav className="container py-4 flex flex-col gap-3">
            {menuItems.map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase py-2 border-b border-border"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
