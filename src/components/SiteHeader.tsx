import { Search, Heart, ShoppingCart, UserPlus, Menu, X, ChevronDown, ChevronUp, Package, User, LogOut, Lock, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SlugLink from "@/components/SlugLink";
import logo from "@/assets/egjeu-logo.png";
import { useNavMenusByLocation } from "@/hooks/useNavMenus";
import { useLanguage } from "@/hooks/useLanguage";
import { useProductSearch } from "@/hooks/useProductSearch";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useCollections";
import { useProfile } from "@/hooks/useProfile";

const productLinks = [
  { label: "Dhomë Gjumi", href: "#" },
  { label: "Spa", href: "#" },
  { label: "Tualet", href: "#" },
  { label: "Pishinë", href: "#" },
  { label: "Dyshek", href: "#" },
  { label: "Shampoo dhe Amenities", href: "#" },
  { label: "Restorant", href: "#" },
];

// ─── Search Dropdown ────────────────────────────────────────────
const SearchDropdown = ({ query, isAl, onSelect }: {
  query: string; isAl: boolean; onSelect: () => void;
}) => {
  const { results, hasQuery } = useProductSearch(query);
  const navigate = useNavigate();

  if (!hasQuery) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
      {results.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
          {isAl ? "Nuk u gjetën produkte" : "No products found"}
        </div>
      ) : (
        <div>
          {results.map((product) => (
            <button
              key={product.id}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border last:border-b-0"
              onClick={() => {
                navigate(`/koleksionet/${product.collectionSlug}/${product.id}`);
                onSelect();
              }}
            >
              <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {isAl ? product.title_al : product.title_en || product.title_al}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {isAl ? product.collectionTitle_al : product.collectionTitle_en || product.collectionTitle_al}
                  {product.code ? ` • ${product.code}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Profile Dropdown ────────────────────────────────────────────
const ProfileDropdown = ({ onClose }: { onClose: () => void }) => {
  const { user, signOut, isAdmin } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { isAl } = useLanguage();
  const navigate = useNavigate();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "";

  const menuItems = [
    { label: isAl ? "Llogaria ime" : "My Account", icon: User, action: () => navigate("/my-account") },
    { label: isAl ? "Të preferuarat" : "Wishlist", icon: Heart, action: () => navigate("/wishlist") },
    { label: isAl ? "Ndrysho fjalëkalimin" : "Change Password", icon: Lock, action: () => { navigate("/my-account"); /* will open password tab */ } },
    ...(isAdmin ? [{ label: "Admin Panel", icon: Settings, action: () => navigate("/admin") }] : []),
  ];

  return (
    <div className="absolute top-full right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
      </div>
      <div className="py-1">
        {menuItems.map(({ label, icon: Icon, action }) => (
          <button
            key={label}
            onClick={() => { action(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors text-left"
          >
            <Icon size={16} className="text-muted-foreground" />
            {label}
          </button>
        ))}
      </div>
      <div className="border-t border-border py-1">
        <button
          onClick={async () => { await signOut(); onClose(); navigate("/"); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-muted/50 transition-colors text-left"
        >
          <LogOut size={16} />
          {isAl ? "Dilni" : "Log out"}
        </button>
      </div>
    </div>
  );
};

const SiteHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [mobileSearchFocused, setMobileSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { lang, setLang } = useLanguage();
  const { data: headerMenus } = useNavMenusByLocation("header");
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: wishlistItems } = useWishlist(user?.id);
  const wishlistCount = wishlistItems?.length ?? 0;
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
  const userInitial = (profile?.full_name?.[0] || user?.email?.[0] || "U").toUpperCase();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setMobileSearchFocused(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clearDesktopSearch = () => {
    setSearchQuery("");
    setSearchFocused(false);
  };

  const clearMobileSearch = () => {
    setMobileSearchQuery("");
    setMobileSearchFocused(false);
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-background">
      {/* === DESKTOP === */}
      <div className="hidden lg:block">
        <div className="border-b border-border">
          <div className="container flex items-center h-12 gap-8 text-[13px] tracking-brand">
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setLang("al")} className={`px-1.5 py-0.5 ${isAl ? "text-foreground font-semibold" : "text-muted-foreground"}`}>AL</button>
              <span className="text-border">|</span>
              <button onClick={() => setLang("en")} className={`px-1.5 py-0.5 ${!isAl ? "text-foreground font-semibold" : "text-muted-foreground"}`}>EN</button>
            </div>
            <span className="text-muted-foreground shrink-0">
              CONTACT: <strong className="text-foreground">+355 69 000 0000</strong>
            </span>
            <div className="relative flex-1 mx-auto max-w-sm" ref={searchRef}>
              <input
                type="text"
                placeholder={isAl ? "Kerko per produkte ketu" : "Search for products here"}
                className="w-full h-8 pl-4 pr-9 text-[13px] border border-border bg-background rounded-full focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60 text-center placeholder:text-center"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
              />
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              {searchFocused && (
                <SearchDropdown
                  query={searchQuery}
                  isAl={isAl}
                  onSelect={clearDesktopSearch}
                />
              )}
            </div>
            <div className="flex items-center gap-7 shrink-0 ml-auto">
              <Link to="/wishlist" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <Heart size={15} className={wishlistCount > 0 ? "fill-primary text-primary" : ""} />
                <span>{wishlistCount}</span>
              </Link>
              <Link to="/shporta" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <ShoppingCart size={15} /> <span>{totalItems}</span>
              </Link>
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3"
                  >
                    <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                      {userInitial}
                    </span>
                    <span className="whitespace-nowrap text-sm">{profile?.full_name || user.email?.split("@")[0]}</span>
                  </button>
                  {profileOpen && <ProfileDropdown onClose={() => setProfileOpen(false)} />}
                </div>
              ) : (
                <SlugLink to="/register" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3">
                  <UserPlus size={15} />
                  <span className="whitespace-nowrap">{isAl ? "REGJISTROHU / HYR" : "REGISTER / LOGIN"}</span>
                </SlugLink>
              )}
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
              <Link to="/wishlist" className="relative text-muted-foreground hover:text-foreground">
                <Heart size={18} className={wishlistCount > 0 ? "fill-primary text-primary" : ""} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>
                )}
              </Link>
              {user ? (
                <Link to="/my-account" className="text-muted-foreground hover:text-foreground">
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                    {userInitial}
                  </span>
                </Link>
              ) : (
                <SlugLink to="/register" className="text-muted-foreground hover:text-foreground"><UserPlus size={18} /></SlugLink>
              )}
              <Link to="/shporta" className="relative text-muted-foreground hover:text-foreground">
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{totalItems}</span>
                )}
              </Link>
            </div>
          </div>
        </div>
        <div className="border-b border-border px-4 py-2" ref={mobileSearchRef}>
          <div className="relative w-full">
            <input
              type="text"
              inputMode="search"
              placeholder={isAl ? "Kërko për produkte këtu..." : "Search for products here..."}
              className="w-full h-11 pl-4 pr-12 text-[16px] border border-border bg-background rounded-full focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              onFocus={() => setMobileSearchFocused(true)}
            />
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            {mobileSearchFocused && (
              <SearchDropdown
                query={mobileSearchQuery}
                isAl={isAl}
                onSelect={clearMobileSearch}
              />
            )}
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
