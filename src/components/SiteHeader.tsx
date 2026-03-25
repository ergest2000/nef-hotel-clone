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

function SearchDropdown(props: { query: string; isAl: boolean; onSelect: () => void }) {
  var query = props.query;
  var isAl = props.isAl;
  var onSelect = props.onSelect;
  var searchResult = useProductSearch(query);
  var results = searchResult.results;
  var hasQuery = searchResult.hasQuery;
  var navigate = useNavigate();
  if (!hasQuery) return null;
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border shadow-lg z-50 max-h-[420px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
      {results.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">{isAl ? "Nuk u gjetën produkte" : "No products found"}</div>
      ) : (
        <div>
          {results.map(function (product: any) {
            return (
              <button key={product.id} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors text-left border-b border-border/50 last:border-b-0" onClick={function () { navigate("/koleksionet/" + product.collectionSlug + "/" + product.id); onSelect(); }}>
                <div className="w-16 h-16 bg-muted overflow-hidden flex-shrink-0 border border-border/30">
                  {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-muted"><Package className="w-6 h-6 text-muted-foreground/20" /></div>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground leading-snug">{isAl ? product.title_al : product.title_en || product.title_al}</p>
                  {product.code && <p className="text-xs text-muted-foreground mt-0.5">{"Kod.: " + product.code}</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LoginModal(props: { onClose: () => void; isAl: boolean; content: any[] | undefined }) {
  var onClose = props.onClose;
  var isAl = props.isAl;
  var content = props.content;
  var emailState = useState("");
  var email = emailState[0];
  var setEmail = emailState[1];
  var passwordState = useState("");
  var password = passwordState[0];
  var setPassword = passwordState[1];
  var loadingState = useState(false);
  var loading = loadingState[0];
  var setLoading = loadingState[1];
  var errorState = useState("");
  var error = errorState[0];
  var setError = errorState[1];
  var auth = useAuth();
  var signIn = auth.signIn;
  var navigate = useNavigate();

  function g(key: string, fallback: string) {
    return getContentValue(content, "login-modal", key, fallback);
  }

  var modalTitle = isAl ? g("title_al", "HYRJE") : g("title_en", "LOGIN");
  var emailLabel = g("email_label", "E-MAIL");
  var passwordLabel = isAl ? g("password_label_al", "KODI") : g("password_label_en", "PASSWORD");
  var forgotText = isAl ? g("forgot_text_al", "KENI HARRUAR FJALËKALIMIN?") : g("forgot_text_en", "FORGOT YOUR PASSWORD?");
  var buttonText = isAl ? g("button_text_al", "HYRJE") : g("button_text_en", "ENTRY");
  var registerText = isAl ? g("register_text_al", "DUA TË KRIJOJ NJË LLOGARI") : g("register_text_en", "I WANT TO CREATE AN ACCOUNT");
  var errorMsg = isAl ? g("error_text_al", "Email ose fjalëkalim i pasaktë.") : g("error_text_en", "Invalid email or password.");
  var modalBg = g("modal_bg_color", "#ffffff");
  var buttonBg = g("button_bg_color", "#1a4a6e");
  var buttonTextColor = g("button_text_color", "#ffffff");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    var result = await signIn(email.trim().toLowerCase(), password.trim());
    setLoading(false);
    if (result.error) {
      setError(errorMsg);
    } else {
      await logAuthEvent(email, "login");
      onClose();
      var r = result.role;
      if (r === "admin" || r === "manager" || r === "editor") {
        navigate("/admin");
      }
    }
  }

  return (
    <div className="absolute top-full right-0 mt-0 w-80 border border-border rounded-lg shadow-2xl z-50 overflow-hidden" style={{ backgroundColor: modalBg }}>
      <div className="p-6">
        <h3 className="text-xs tracking-brand text-foreground uppercase font-semibold mb-5">{modalTitle}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] tracking-wider text-muted-foreground uppercase">{emailLabel}</label>
            <Input value={email} onChange={function (e: any) { setEmail(e.target.value); }} type="email" required className="h-10 text-sm border-0 border-b border-border rounded-none px-0 focus-visible:ring-0" />
          </div>
          <div>
            <label className="text-[10px] tracking-wider text-muted-foreground uppercase">{passwordLabel}</label>
            <Input value={password} onChange={function (e: any) { setPassword(e.target.value); }} type="password" required className="h-10 text-sm border-0 border-b border-border rounded-none px-0 focus-visible:ring-0" />
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
}

function ProfileDropdown(props: { onClose: () => void }) {
  var onClose = props.onClose;
  var auth = useAuth();
  var user = auth.user;
  var signOut = auth.signOut;
  var isAdminUser = auth.isAdmin;
  var profileData = useProfile(user ? user.id : undefined);
  var profile = profileData.data;
  var offersData = useUserOffers(user ? user.id : undefined);
  var offers = offersData.data;
  var langHook = useLanguage();
  var isAl = langHook.isAl;
  var navigate = useNavigate();
  var displayName = "";
  if (profile && profile.full_name) {
    displayName = profile.full_name;
  } else if (user && user.email) {
    displayName = user.email.split("@")[0];
  }
  var unseenOffers = offers ? offers.filter(function (o: any) { return !o.seen; }) : [];
  var menuItems = [
    { label: isAl ? "Llogaria ime" : "My Account", icon: User, action: function () { navigate("/my-account"); } },
    { label: isAl ? "Të preferuarat" : "Wishlist", icon: Heart, action: function () { navigate("/wishlist"); } },
    { label: isAl ? "Ndrysho fjalëkalimin" : "Change Password", icon: Lock, action: function () { navigate("/my-account"); } },
  ];
  if (isAdminUser) {
    menuItems.push({ label: "Admin Panel", icon: Settings, action: function () { navigate("/admin"); } });
  }

  return (
    <div className="absolute top-full right-0 mt-0 w-72 bg-background border border-border rounded-lg shadow-2xl z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground truncate">{user ? user.email : ""}</p>
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
            {offers.slice(0, 5).map(function (offer: any) {
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
        {menuItems.map(function (item: any) {
          var Icon = item.icon;
          return (
            <button key={item.label} onClick={function () { item.action(); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors text-left">
              <Icon size={16} className="text-muted-foreground" />{item.label}
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
}

function SiteHeader() {
  var mobileMenuState = useState(false);
  var mobileMenuOpen = mobileMenuState[0];
  var setMobileMenuOpen = mobileMenuState[1];
  var desktopMenuState = useState(false);
  var desktopMenuOpen = desktopMenuState[0];
  var setDesktopMenuOpen = desktopMenuState[1];
  var mobileProductsState = useState(false);
  var mobileProductsOpen = mobileProductsState[0];
  var setMobileProductsOpen = mobileProductsState[1];
  var searchQueryState = useState("");
  var searchQuery = searchQueryState[0];
  var setSearchQuery = searchQueryState[1];
  var searchFocusedState = useState(false);
  var searchFocused = searchFocusedState[0];
  var setSearchFocused = searchFocusedState[1];
  var mobileSearchQueryState = useState("");
  var mobileSearchQuery = mobileSearchQueryState[0];
  var setMobileSearchQuery = mobileSearchQueryState[1];
  var mobileSearchFocusedState = useState(false);
  var mobileSearchFocused = mobileSearchFocusedState[0];
  var setMobileSearchFocused = mobileSearchFocusedState[1];
  var profileOpenState = useState(false);
  var profileOpen = profileOpenState[0];
  var setProfileOpen = profileOpenState[1];
  var loginOpenState = useState(false);
  var loginOpen = loginOpenState[0];
  var setLoginOpen = loginOpenState[1];
  var searchRef = useRef<HTMLDivElement>(null);
  var mobileSearchRef = useRef<HTMLDivElement>(null);
  var profileRef = useRef<HTMLDivElement>(null);
  var loginRef = useRef<HTMLDivElement>(null);
  var langHook = useLanguage();
  var lang = langHook.lang;
  var setLang = langHook.setLang;
  var headerMenusData = useNavMenusByLocation("header");
  var headerMenus = headerMenusData.data;
  var cartHook = useCart();
  var totalItems = cartHook.totalItems;
  var authHook = useAuth();
  var user = authHook.user;
  var profileData = useProfile(user ? user.id : undefined);
  var profile = profileData.data;
  var wishlistData = useWishlist(user ? user.id : undefined);
  var wishlistItems = wishlistData.data;
  var offersData = useUserOffers(user ? user.id : undefined);
  var offers = offersData.data;
  var modalContentData = usePageContent("home", "al");
  var modalContent = modalContentData.data;
  var wishlistCount = wishlistItems ? wishlistItems.length : 0;
  var unseenOffersCount = offers ? offers.filter(function (o: any) { return !o.seen; }).length : 0;
  var mainLinks = headerMenus ? headerMenus.map(function (m: any) { return { label: m.label, href: m.href }; }) : [
    { label: "About Us", href: "/company" },
    { label: "Our Clients", href: "/clients" },
    { label: "Certifications", href: "/#certifications" },
    { label: "Blog", href: "/blog" },
    { label: "Catalogue", href: "#" },
    { label: "Tailor Made", href: "/tailor-made" },
    { label: "Contact", href: "/contact" },
  ];
  var isAl = lang === "al";
  var userInitial = "U";
  if (profile && profile.full_name) {
    userInitial = profile.full_name[0].toUpperCase();
  } else if (user && user.email) {
    userInitial = user.email[0].toUpperCase();
  }

  useEffect(function () {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false);
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) setMobileSearchFocused(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) setLoginOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return function () { document.removeEventListener("mousedown", handler); };
  }, []);

  function clearDesktopSearch() { setSearchQuery(""); setSearchFocused(false); }
  function clearMobileSearch() { setMobileSearchQuery(""); setMobileSearchFocused(false); }

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
              <input type="text" placeholder={isAl ? "Kerko per produkte ketu" : "Search for products here"} className="w-full h-8 pl-4 pr-9 text-[13px] border border-border bg-background rounded-full focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60 text-center placeholder:text-center" value={searchQuery} onChange={function (e: any) { setSearchQuery(e.target.value); }} onFocus={function () { setSearchFocused(true); }} />
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
                    <span className="whitespace-nowrap text-sm">{profile ? profile.full_name : (user.email ? user.email.split("@")[0] : "")}</span>
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
                {mainLinks.map(function (item: any) { return <SlugLink key={item.label} to={item.href} onClick={function () { setDesktopMenuOpen(false); }} className="text-xs tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase py-2">{item.label}</SlugLink>; })}
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
            <input type="text" inputMode="search" placeholder={isAl ? "Kërko për produkte këtu..." : "Search for products here..."} className="w-full h-11 pl-4 pr-12 text-[16px] border border-border bg-background rounded-full focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50" value={mobileSearchQuery} onChange={function (e: any) { setMobileSearchQuery(e.target.value); }} onFocus={function () { setMobileSearchFocused(true); }} />
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
              {mainLinks.map(function (item: any) { return <SlugLink key={item.label} to={item.href} onClick={function () { setMobileMenuOpen(false); }} className="text-sm tracking-brand text-muted-foreground hover:text-primary transition-colors uppercase py-2.5 border-b border-border last:border-b-0">{item.label}</SlugLink>; })}
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
}

export default SiteHeader;
