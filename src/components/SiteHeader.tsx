import { Search, Heart, ShoppingCart, UserPlus, Menu, X, ChevronDown, ChevronUp, Package, User, LogOut, Lock, Settings, Tag, Gift } from "lucide-react";
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
import { useUserOffers } from "@/hooks/useOffers";
import { usePageContent, getContentValue } from "@/hooks/useCms";
import { Input } from "@/components/ui/input";
import { logAuthEvent } from "@/hooks/useAuthTexts";

var productLinks = [
  { label: "Dhomë Gjumi", href: "#" },
  { label: "Spa", href: "#" },
  { label: "Tualet", href: "#" },
  { label: "Pishinë", href: "#" },
  { label: "Dyshek", href: "#" },
  { label: "Shampoo dhe Amenities", href: "#" },
  { label: "Restorant", href: "#" },
];

var SearchDropdown = function ({ query, isAl, onSelect }: { query: string; isAl: boolean; onSelect: () => void }) {
  const { results, hasQuery } = useProductSearch(query);
  const navigate = useNavigate();
  if (!hasQuery) return null;
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
      {results.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">{isAl ? "Nuk u gjetën produkte" : "No products found"}</div>
      ) : (
        <div>
          {results.map(function (product) {
            return (
              <button key={product.id} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border last:border-b-0" onClick={function () { navigate("/koleksionet/" + product.collectionSlug + "/" + product.id); onSelect(); }}>
                <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                  {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-muted-foreground/30" /></div>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{isAl ? product.title_al : product.title_en || product.title_al}</p>
                  <p className="text-xs text-muted-foreground truncate">{isAl ? product.collectionTitle_al : product.collectionTitle_en || product.collectionTitle_al}{product.code ? " • " + product.code : ""}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

var LoginModal = function ({ onClose, isAl, content }: { onClose: () => void; isAl: boolean; content: any[] | undefined }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  var g = function (key: string, fallback: string) {
    return getContentValue(content, "login-modal", key, fallback);
  };

  var modalTitle = isAl ? g("title_al", "HYRJE") : g("title_en", "LOGIN");
  var emailLabel = g("email_label", "E-MAIL");
  var passwordLabel = isAl ? g("password_label_al", "KODI") : g("password_label_en", "PASSWORD");
  var forgotText = isAl ? g("forgot_text_al", "KENI HARRUAR FJALËKALIMIN?") : g("forgot_text_en", "FORGOT YOUR PASSWORD?");
  var buttonText = isAl ? g("button_text_al", "HYRJE") : g("button_text_en", "ENTRY");
  var registerText = isAl ? g("register_text_al", "DUA TË KRIJOJ NJË LLOGARI") : g("register_text_en", "I WANT TO CREATE AN ACCOUNT");
  var errorText = isAl ? g("error_text_al", "Email ose fjalëkalim i pasaktë.") : g("error_text_en", "Invalid email or password.");
  var modalBg = g("modal_bg_color", "#ffffff");
  var buttonBg = g("button_bg_color", "#1a4a6e");
  var buttonTextColor = g("button_text_color", "#ffffff");

  var handleSubmit = async function (e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    var result = await signIn(email.trim().toLowerCase(), password.trim());
    setLoading(false);
    if (result.error) {
      setError(errorText);
    } else {
      await logAuthEvent(email, "login");
      onClose();
      if (result.role === "admin" || result.role === "manager" || result.role === "editor") {
        navigate("/admin");
      }
    }
  };

  return (
    <div className="absolute top-full right-0 mt-0 w-80 border border-border rounded-lg shadow-2xl z-50 overflow-hidden" style={{ backgroundColor: modalBg }}>
      <div className="p-6">
        <h3 className="text-xs tracking-brand text-foreground uppercase font-semibold mb-5">{modalTitle}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] tracking-wider text-muted-foreground uppercase">{emailLabel}</label>
            <Input value={email} onChange={function (e) { setEmail(e.target.value); }} type="email" required className="h-10 text-sm border-0 border-b border-border rounded-none px-0 focus-visible:ring-0" />
          </div>
          <div>
            <label className="text-[10px] tracking-wider text-muted-foreground uppercase">{passwordLabel}</label>
            <Input value={password} onChange={function (e) { setPassword(e.target.value); }} type="password" required className="h-10 text-sm border-0 border-b border-border rounded-none px-0 focus-visible:ring-0" />
          </div>
          <div className="text-right">
            <Link to="/reset-password" onClick={onClose} className="text-[9px] tracking-wider text-muted-foreground hover:text-foreground uppercase">{forgotText}</Link>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button type="submit" disabled={loading} className="w-full h-11 text-xs tracking-wider uppercase rounded-none font-semibold transition-colors" style={{ backgroundColor: buttonBg, color: buttonTextColor }}>
            {loading ? "..." : buttonText}
          </button>
        </form>
        <div className="mt-5 pt-4 border-t border-border text-center">
          <SlugLink to="/register" onClick={onClose} className="text-[10px] tracking-wider text-muted-foreground hover:text-foreground uppercase">{registerText}</SlugLink>
        </div>
      </div>
    </div>
  );
};

var ProfileDropdown = function ({ onClose }: { onClose: () => void }) {
  const { user, signOut, isAdmin } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: offers } = useUserOffers(user?.id);
  const { isAl } = useLanguage();
  const navigate = useNavigate();
  var displayName = profile?.full_name || (user?.email ? user.email.split("@")[0] : "");
  var unseenOffers = offers ? offers.filter(function (o) { return !o.seen; }) : [];
  var menuItems = [
    { label: isAl ? "Llogaria ime" : "My Account", icon: User, action: function () { navigate("/my-account"); } },
    { label: isAl ? "Të preferuarat" : "Wishlist", icon: Heart, action: function () { navigate("/wishlist"); } },
    { label: isAl ? "Ndrysho fjalëkalimin" : "Change Password", icon: Lock, action: function () { navigate("/my-account"); } },
  ];
  if (isAdmin) {
    menuItems.push({ label: "Admin Panel", icon: Settings, action: function () { navigate("/admin"); } });
  }

  return (
    <div className="absolute top-full right-0 mt-0 w-72 bg-background border border-border rounded-lg shadow-2xl z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
      </div>
      {offers && offers.length > 0 && (
        <div className="border-b border-border">
          <div className="px-4 py-2 bg-primary/5">
            <p className="text-xs tracking-brand text-primary uppercase flex items-center gap-1.5">
              <Gift size={14} />
              {isAl ? "Ofertat e tua" : "Your Offers"}
              {unseenOffers.length > 0 && <span className="ml-auto bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">{unseenOffers.length}</span>}
            </p>
          </div>
          <div className="max-h-[160px] overflow-y-auto">
            {offers.slice(0, 5).map(function (offer) {
              return (
                <button key={offer.id} onClick={function () { if (offer.product_id) navigate("/koleksionet/all/" + offer.product_id); onClose(); }} className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left">
                  <Tag size={14} className="text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {isAl ? offer.title_al : offer.title_en || offer.title_al}
                      {offer.discount_percent > 0 && <span className="ml-1.5 text-primary font-bold">-{offer.discount_percent}%</span>}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{isAl ? offer.description_al : offer.description_en || offer.description_al}</p>
                    {!offer.seen && <span className="inline-block mt-0.5 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-semibold">{isAl ? "E re" : "New"}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="py-1">
        {menuItems.map(function (item) {
          return (
            <button key={item.label} onClick={function () { item.action(); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors text-left">
              <item.icon size={16} className="text-muted-foreground" />{item.label}
            </button>
          );
        })}
      </div>
      <div className="border-t border-border py-1">
        <button onClick={async function () { await signOut(); onClose(); navigate("/"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-muted/50 transition-colors text-left">
          <LogOut size={16} />{isAl ? "Dilni" : "Log out"}
        </button>
      </div>
    </div>
  );
};

var SiteHeader = function () {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [mobileSearchFocused, setMobileSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);
  const { lang, setLang } = useLanguage();
  const { data: headerMenus } = useNavMenusByLocation("header");
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: wishlistItems } = useWishlist(user?.id);
  const { data: offers } = useUserOffers(user?.id);
  const { data: modalContent } = usePageContent("home", "al");
  var wishlistCount = wishlistItems ? wishlistItems.length : 0;
  var unseenOffersCount = offers ? offers.filter(function (o) { return !o.seen; }).length : 0;
  var mainLinks = headerMenus ? headerMenus.map(function (m) { return { label: m.label, href: m.href }; }) : [
    { label: "About Us", href: "/company" },
    { label: "Our Clients", href: "/clients" },
    { label: "Certifications", href: "/#certifications" },
    { label: "Blog", href: "/blog" },
    { label: "Catalogue", href: "#" },
    { label: "Tailor Made", href: "/tailor-made" },
    { label: "Contact", href: "/contact" },
  ];
  var isAl = lang === "al";
  var userInitial = (profile?.full_name ? profile.full_name[0] : (user?.email ? user.email[0] : "U")).toUpperCase();

  useEffect(function () {
    var handler = function (e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false);
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) setMobileSearchFocused(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) setLoginOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return function () { document.removeEventListener("mousedown", handler); };
  }, []);

  var clearDesktopSearch = function () { setSearchQuery(""); setSearchFocused(false); };
  var clearMobileSearch = function () { setMobileSearchQuery(""); setMobileSearchFocused(false); };

  return (
    <header className="w-full sticky top-0 z-50 bg-background">
      <div className="hidden lg:block">
        <div className="border-b border-border">
          <div className="container flex items-center h-12 gap-8 text-[13px] tracking-brand">
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={function () { setLang("al"); }} className={"px-1.5 py-0.5 " + (isAl ? "text-foreground font-semibold" : "text-muted-foreground")}>AL</button>
              <span className="text-border">|</span>
              <button onClick={function () { setLang("en"); }} className={"px-1.5 py-0.5 " + (!isAl ? "text-foreground font-semibold" : "text-muted-foreground")}>EN</button>
            </div>
            <span className="text-muted-foreground shrink-0">CONTACT: <strong className="text-foreground">+355 69 000 0000</strong></span>
            <div className="relative flex-1 mx-auto max-w-sm" ref={searchRef}>
              <input type="text" placeholder={isAl ? "Kerko per produkte ketu" : "Search for products here"} className="w-full h-8 pl-4 pr-9 text-[13px] border border-border bg-background rounded-full focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60 text-center placeholder:text-center" value={searchQuery} onChange={function (e) { setSearchQuery(e.target.value); }} onFocus={function () { setSearchFocused(true); }} />
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              {searchFocused && <SearchDropdown query={searchQuery} isAl={isAl} onSelect={clearDesktopSearch} />}
            </div>
            <div className="flex items-center gap-7 shrink-0 ml-auto">
              <Link to="/wishlist" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <Heart size={15} className={wishlistCount > 0 ? "fill-primary text-primary" : ""} /><span>{wishlistCount}</span>
              </Link>
              <Link to="/shporta" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"><ShoppingCart size={15} /><span>{totalItems}</span></Link>
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button onClick={function () { setProfileOpen(!profileOpen); setLoginOpen(false); }} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3">
                    <span className="relative w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                      {userInitial}
                      {unseenOffersCount > 0 && <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{unseenOffersCount}</span>}
                    </span>
                    <span className="whitespace-nowrap text-sm">{profile?.full_name || (user.email ? user.email.split("@")[0] : "")}</span>
                  </button>
                  {profileOpen && <ProfileDropdown onClose={function () { setProfileOpen(false); }} />}
                </div>
              ) : (
                <div className="relative" ref={loginRef}>
                  <button onClick={function () { setLoginOpen(!loginOpen); setProfileOpen(false); }} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3">
                    <UserPlus size={15} />
                    <span className="whitespace-nowrap">{isAl ? "REGJISTROHU / HYR" : "REGISTER / LOGIN"}</span>
                  </button>
                  {loginOpen && <LoginModal onClose={function () { setLoginOpen(false); }} isAl={isAl} content={modalContent} />}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="border-b border-border">
          <div className="container flex items-center h-20 gap-4">
            <Link to="/" className="flex items-center gap-3 shrink-0"><img src={logo} alt="EGJEU" className="h-14 w-auto" /></Link>
            <button className="text-foreground hover:text-primary transition-colors shrink-0" onClick={function () { setDesktopMenuOpen(!desktopMenuOpen); }}>{desktopMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
            <nav className="flex items-center gap-4 xl:gap-5">
              {productLinks.map(function (item) { return <SlugLink key={item.label} to={item.href} className="text-[10px] xl:text-xs tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase whitespace-nowrap">{item.label}</SlugLink>; })}
            </nav>
          </div>
        </div>
        {desktopMenuOpen && (
          <div className="border-b border-border bg-background shadow-sm">
            <div className="container py-6">
              <div className="flex flex-col gap-1">
                {mainLinks.map(function (item) { return <SlugLink key={item.label} to={item.href} onClick={function () { setDesktopMenuOpen(false); }} className="text-xs tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase py-2">{item.label}</SlugLink>; })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="lg:hidden">
        <div className="border-b border-border">
          <div className="container flex items-center justify-between h-14">
            <button className="text-foreground" onClick={function () { setMobileMenuOpen(!mobileMenuOpen); }}>{mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}</button>
            <Link to="/" className="absolute left-1/2 -translate-x-1/2"><img src={logo} alt="EGJEU" className="h-9 w-auto" /></Link>
            <div className="flex items-center gap-4">
              <Link to="/wishlist" className="relative text-muted-foreground hover:text-foreground">
                <Heart size={18} className={wishlistCount > 0 ? "fill-primary text-primary" : ""} />
                {wishlistCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>}
              </Link>
              {user ? (
                <Link to="/my-account" className="relative text-muted-foreground hover:text-foreground">
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">{userInitial}</span>
                  {unseenOffersCount > 0 && <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{unseenOffersCount}</span>}
                </Link>
              ) : (
                <SlugLink to="/register" className="text-muted-foreground hover:text-foreground"><UserPlus size={18} /></SlugLink>
              )}
              <Link to="/shporta" className="relative text-muted-foreground hover:text-foreground">
                <ShoppingCart size={18} />
                {totalItems > 0 && <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{totalItems}</span>}
              </Link>
            </div>
          </div>
        </div>
        <div className="border-b border-border px-4 py-2" ref={mobileSearchRef}>
          <div className="relative w-full">
            <input type="text" inputMode="search" placeholder={isAl ? "Kërko për produkte këtu..." : "Search for products here..."} className="w-full h-11 pl-4 pr-12 text-[16px] border border-border bg-background rounded-full focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50" value={mobileSearchQuery} onChange={function (e) { setMobileSearchQuery(e.target.value); }} onFocus={function () { setMobileSearchFocused(true); }} />
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            {mobileSearchFocused && <SearchDropdown query={mobileSearchQuery} isAl={isAl} onSelect={clearMobileSearch} />}
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-b border-border bg-background">
            <div className="container py-3 flex flex-col gap-1">
              <button onClick={function () { setMobileProductsOpen(!mobileProductsOpen); }} className="flex items-center justify-between text-sm tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase py-2.5 border-b border-border">
                <span>{isAl ? "Produkte" : "Products"}</span>
                {mobileProductsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {mobileProductsOpen && (
                <div className="flex flex-col gap-1 pl-4">
                  {productLinks.map(function (item) { return <SlugLink key={item.label} to={item.href} onClick={function () { setMobileMenuOpen(false); setMobileProductsOpen(false); }} className="text-sm tracking-brand text-muted-foreground/80 hover:text-primary transition-colors uppercase py-2 border-b border-border/50 last:border-b-0">{item.label}</SlugLink>; })}
                </div>
              )}
              {mainLinks.map(function (item) { return <SlugLink key={item.label} to={item.href} onClick={function () { setMobileMenuOpen(false); }} className="text-sm tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase py-2.5 border-b border-border last:border-b-0">{item.label}</SlugLink>; })}
              <div className="flex items-center gap-2 pt-3 text-xs text-muted-foreground">
                <button onClick={function () { setLang("al"); }} className={isAl ? "font-semibold text-foreground" : ""}>AL</button>
                <span>|</span>
                <button onClick={function () { setLang("en"); }} className={!isAl ? "font-semibold text-foreground" : ""}>EN</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default SiteHeader;
