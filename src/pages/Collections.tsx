import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  useCollections,
  useProducts,
  useWishlist,
  useToggleWishlist,
  useAllProductColors,
  useAllProductSizes,
  useAllProductColorAssignments,
  type ProductColor,
  type ProductSize,
  type ProductColorAssignment,
} from "@/hooks/useCollections";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { usePageContent, getContentValue } from "@/hooks/useCms";
import { Heart, ChevronRight } from "lucide-react";
import ProductColorPicker from "@/components/ProductColorPicker";
import type { Tables } from "@/integrations/supabase/types";

type Collection = Tables<"collections">;
type Product = Tables<"products">;

/* ── Title Case helper ─────────────────────────────────────────── */
const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .replace(/(?:^|\s|[-/])\S/g, (match) => match.toUpperCase());

/* ── Product Card ──────────────────────────────────────────────── */
const ProductCard = ({
  product,
  collectionSlug,
  isAl,
  productColors,
  assignments,
}: {
  product: Product;
  collectionSlug: string;
  isAl: boolean;
  productColors?: ProductColor[];
  assignments?: ProductColorAssignment[];
}) => {
  const { user } = useAuth();
  const { data: wishlist } = useWishlist(user?.id);
  const toggleWishlist = useToggleWishlist();
  const isWishlisted =
    wishlist?.some((w) => w.product_id === product.id) ?? false;

  const title = isAl
    ? product.title_al || product.title_en
    : product.title_en || product.title_al;

  const dimensions = isAl
    ? product.dimensions_al || product.dimensions_en
    : product.dimensions_en || product.dimensions_al;

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeColorId, setActiveColorId] = useState<string | null>(null);
  const image = activeImage || product.image_url || "";

  const colors = productColors?.filter((c) => c.product_id === product.id) ?? [];
  const productAssignments = assignments?.filter((a) => a.product_id === product.id) ?? [];
  const hasColors = productAssignments.length > 0 || colors.length > 0;

  const handleColorClick = (color: ProductColor) => {
    if (activeColorId === color.id) {
      // Deselect
      setActiveColorId(null);
      setActiveImage(null);
    } else {
      setActiveColorId(color.id);
      if ((color as any).image_url) {
        setActiveImage((color as any).image_url);
      } else {
        setActiveImage(null);
      }
    }
  };

  return (
    <div className="group relative flex flex-col">
      <Link
        to={`/koleksionet/${collectionSlug}/${product.id}`}
        className="block"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              {isAl ? "Pa imazh" : "No image"}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1">
          <span className="block text-sm md:text-base text-foreground font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
            {title ? toTitleCase(title) : ""}
          </span>
          {dimensions && (
            <p className="text-xs md:text-sm text-muted-foreground">
              {isAl ? "Dimensioni:" : "Dimensions:"} {dimensions}
            </p>
          )}
        </div>
      </Link>

      {/* Color swatches */}
      {hasColors && (
        <div className="mt-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <ProductColorPicker
            assignments={productAssignments}
            legacyColors={colors}
            selectedColorId={activeColorId}
            onSelectColor={(id) => {
              if (id === activeColorId) {
                setActiveColorId(null);
                setActiveImage(null);
              } else if (id) {
                setActiveColorId(id);
                const a = productAssignments.find((x) => x.id === id);
                const c = colors.find((x) => x.id === id);
                setActiveImage(a?.image_url || (c as any)?.image_url || null);
              } else {
                setActiveColorId(null);
                setActiveImage(null);
              }
            }}
            compact
          />
        </div>
      )}

      {/* Wishlist */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!user) return;
          toggleWishlist.mutate({
            userId: user.id,
            productId: product.id,
            isWishlisted,
          });
        }}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          size={18}
          className={
            isWishlisted
              ? "fill-red-500 text-red-500"
              : "text-foreground/40 group-hover:text-foreground/60"
          }
        />
      </button>
    </div>
  );
};

/* ── Sidebar Filters ───────────────────────────────────────────── */
const FilterSidebar = ({
  collections,
  activeSlug,
  isAl,
  allColors,
  allSizes,
  compositions,
  selectedColors,
  selectedSizes,
  selectedCompositions,
  onToggleColor,
  onToggleSize,
  onToggleComposition,
}: {
  collections: Collection[];
  activeSlug: string | undefined;
  isAl: boolean;
  allColors: ProductColor[];
  allSizes: ProductSize[];
  compositions: string[];
  selectedColors: string[];
  selectedSizes: string[];
  selectedCompositions: string[];
  onToggleColor: (id: string) => void;
  onToggleSize: (id: string) => void;
  onToggleComposition: (value: string) => void;
}) => {
  const navigate = useNavigate();

  const parents = collections.filter(
    (c) => !c.parent_id && c.visible !== false
  );
  const children = collections.filter(
    (c) => c.parent_id && c.visible !== false
  );

  // Deduplicate colors by name
  const uniqueColors = useMemo(() => {
    const seen = new Set<string>();
    return allColors.filter((c) => {
      const name = (isAl ? c.color_name_al : c.color_name_en) || c.color_name;
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [allColors, isAl]);

  // Deduplicate sizes by label
  const uniqueSizes = useMemo(() => {
    const seen = new Set<string>();
    return allSizes.filter((s) => {
      if (seen.has(s.size_label)) return false;
      seen.add(s.size_label);
      return true;
    });
  }, [allSizes]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg md:text-xl font-light text-foreground">
        {isAl ? "Filtra" : "Filters"}
      </h2>

      {/* Collection nav */}
      <div>
        <h3 className="text-xs font-bold tracking-brand uppercase text-foreground mb-3">
          {isAl ? "Koleksionet" : "Collections"}
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => navigate("/koleksionet")}
            className={`block w-full text-left text-sm py-1 transition-colors ${
              !activeSlug
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isAl ? "Të gjitha" : "All"}
          </button>
          {parents.map((col) => {
            const isActive = activeSlug === col.slug;
            const title = isAl
              ? col.title_al || col.title_en
              : col.title_en || col.title_al;
            const colChildren = children.filter(
              (c) => c.parent_id === col.id
            );

            return (
              <div key={col.id}>
                <button
                  onClick={() => navigate(`/koleksionet/${col.slug}`)}
                  className={`block w-full text-left text-sm py-1 transition-colors ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {title}
                </button>
                {colChildren.length > 0 && (
                  <div className="ml-3 space-y-0.5">
                    {colChildren.map((child) => {
                      const childTitle = isAl
                        ? child.title_al || child.title_en
                        : child.title_en || child.title_al;
                      return (
                        <button
                          key={child.id}
                          onClick={() =>
                            navigate(`/koleksionet/${child.slug}`)
                          }
                          className={`block w-full text-left text-xs py-0.5 transition-colors ${
                            activeSlug === child.slug
                              ? "text-primary font-semibold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {childTitle}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <hr className="border-border" />

      {/* Color filter */}
      {uniqueColors.length > 0 && (
        <div>
          <h3 className="text-xs font-bold tracking-brand uppercase text-foreground mb-3">
            {isAl ? "Ngjyra" : "Color"}
          </h3>
          <div className="space-y-2">
            {uniqueColors.map((color) => {
              const label =
                (isAl ? color.color_name_al : color.color_name_en) ||
                color.color_name;
              const isChecked = selectedColors.includes(color.color_name);
              return (
                <label
                  key={color.id}
                  className="flex items-center gap-2 cursor-pointer group/filter"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleColor(color.color_name)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                  />
                  {color.color_hex && (
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-border/50 shrink-0"
                      style={{ backgroundColor: color.color_hex }}
                    />
                  )}
                  <span className="text-sm text-muted-foreground group-hover/filter:text-foreground transition-colors">
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
          <hr className="border-border mt-4" />
        </div>
      )}

      {/* Size filter */}
      {uniqueSizes.length > 0 && (
        <div>
          <h3 className="text-xs font-bold tracking-brand uppercase text-foreground mb-3">
            {isAl ? "Përmasa" : "Size"}
          </h3>
          <div className="space-y-2">
            {uniqueSizes.map((size) => {
              const isChecked = selectedSizes.includes(size.size_label);
              return (
                <label
                  key={size.id}
                  className="flex items-center gap-2 cursor-pointer group/filter"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleSize(size.size_label)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground group-hover/filter:text-foreground transition-colors">
                    {size.size_label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Composition filter */}
      {compositions.length > 0 && (
        <div>
          <h3 className="text-xs font-bold tracking-brand uppercase text-foreground mb-3">
            {isAl ? "Përbërja" : "Composition"}
          </h3>
          <div className="space-y-2">
            {compositions.map((comp) => {
              const isChecked = selectedCompositions.includes(comp);
              return (
                <label
                  key={comp}
                  className="flex items-center gap-2 cursor-pointer group/filter"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleComposition(comp)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground group-hover/filter:text-foreground transition-colors">
                    {comp}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Breadcrumb ────────────────────────────────────────────────── */
const Breadcrumb = ({
  collection,
  parentCollection,
  isAl,
  hasImage = true,
}: {
  collection?: Collection;
  parentCollection?: Collection;
  isAl: boolean;
  hasImage?: boolean;
}) => {
  const crumbs: { label: string; to?: string }[] = [
    { label: isAl ? "Kryesore" : "Home", to: "/" },
  ];

  if (parentCollection) {
    const parentTitle = isAl
      ? parentCollection.title_al || parentCollection.title_en
      : parentCollection.title_en || parentCollection.title_al;
    crumbs.push({
      label: parentTitle,
      to: `/koleksionet/${parentCollection.slug}`,
    });
  }

  if (collection) {
    const title = isAl
      ? collection.title_al || collection.title_en
      : collection.title_en || collection.title_al;
    crumbs.push({ label: title });
  } else {
    crumbs.push({ label: isAl ? "Koleksionet" : "Collections" });
  }

  const sepColor = hasImage ? "text-white/50" : "text-muted-foreground/50";
  const linkColor = hasImage ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground";
  const activeColor = hasImage ? "text-white/90" : "text-foreground";

  return (
    <nav className="flex items-center gap-1.5 text-[11px] tracking-brand uppercase">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <span className={sepColor}>–</span>
          )}
          {crumb.to ? (
            <Link
              to={crumb.to}
              className={`${linkColor} transition-colors`}
            >
              {crumb.label}
            </Link>
          ) : (
            <span className={activeColor}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

/* ── Main Collections Page ─────────────────────────────────────── */
const Collections = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAl, lang } = useLanguage();
  const navigate = useNavigate();
  const { data: collections, isLoading: loadingCols } = useCollections();
  const { data: allProducts, isLoading: loadingProducts } = useProducts();
  const { data: allColors } = useAllProductColors();
  const { data: allAssignments } = useAllProductColorAssignments();
  const { data: allSizes } = useAllProductSizes();

  // CMS content for collections page
  const { data: cmsContent } = usePageContent("collections", lang);

  // Filter state
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCompositions, setSelectedCompositions] = useState<string[]>([]);

  const toggleColor = (name: string) =>
    setSelectedColors((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  const toggleSize = (label: string) =>
    setSelectedSizes((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  const toggleComposition = (value: string) =>
    setSelectedCompositions((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );

  // Active collection
  const activeCollection = useMemo(
    () => collections?.find((c) => c.slug === slug),
    [collections, slug]
  );

  // Parent collection (for breadcrumb)
  const parentCollection = useMemo(
    () =>
      activeCollection?.parent_id
        ? collections?.find((c) => c.id === activeCollection.parent_id)
        : undefined,
    [activeCollection, collections]
  );

  // Extract unique composition values from all products
  const compositions = useMemo(() => {
    if (!allProducts) return [];
    const compSet = new Set<string>();
    allProducts.forEach((p) => {
      const comp = isAl
        ? p.composition_al || p.composition_en
        : p.composition_en || p.composition_al;
      if (comp) {
        // Split by common separators (comma, /, &) to get individual materials
        comp
          .split(/[,\/&]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .forEach((s) => compSet.add(s));
      }
    });
    return Array.from(compSet).sort();
  }, [allProducts, isAl]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];

    let products = allProducts;

    // Filter by collection
    if (activeCollection) {
      const childIds =
        collections
          ?.filter((c) => c.parent_id === activeCollection.id)
          .map((c) => c.id) ?? [];
      const relevantIds = [activeCollection.id, ...childIds];
      products = products.filter((p) => relevantIds.includes(p.collection_id));
    }

    // Filter by color
    if (selectedColors.length > 0 && allColors) {
      const matchingProductIds = new Set(
        allColors
          .filter((c) => selectedColors.includes(c.color_name))
          .map((c) => c.product_id)
      );
      products = products.filter((p) => matchingProductIds.has(p.id));
    }

    // Filter by size
    if (selectedSizes.length > 0 && allSizes) {
      const matchingProductIds = new Set(
        allSizes
          .filter((s) => selectedSizes.includes(s.size_label))
          .map((s) => s.product_id)
      );
      products = products.filter((p) => matchingProductIds.has(p.id));
    }

    // Filter by composition
    if (selectedCompositions.length > 0) {
      products = products.filter((p) => {
        const comp = isAl
          ? p.composition_al || p.composition_en
          : p.composition_en || p.composition_al;
        if (!comp) return false;
        return selectedCompositions.some((sc) =>
          comp.toLowerCase().includes(sc.toLowerCase())
        );
      });
    }

    return products;
  }, [
    allProducts,
    activeCollection,
    collections,
    selectedColors,
    selectedSizes,
    selectedCompositions,
    allColors,
    allSizes,
    isAl,
  ]);

  // Collection slug for each product
  const getCollectionSlug = (product: Product) => {
    const col = collections?.find((c) => c.id === product.collection_id);
    return col?.slug || slug || "all";
  };

  // Page text — CMS first, then collection data, then hardcoded fallback
  const pageTitle = activeCollection
    ? getContentValue(cmsContent, `collection_${activeCollection.slug}`, "title", "")
      || (isAl ? activeCollection.title_al || activeCollection.title_en : activeCollection.title_en || activeCollection.title_al)
    : getContentValue(cmsContent, "hero", "title", isAl ? "Koleksionet" : "Collections");

  const pageDescription = activeCollection
    ? getContentValue(cmsContent, `collection_${activeCollection.slug}`, "subtitle", "")
      || (isAl ? activeCollection.description_al || activeCollection.description_en : activeCollection.description_en || activeCollection.description_al)
    : getContentValue(cmsContent, "hero", "subtitle", isAl ? "Zbuloni gamën tonë të plotë të produkteve premium për hotele." : "Discover our full range of premium hotel products.");

  // Hero image — CMS first, then collection image, then first collection's image as fallback
  const heroImage = activeCollection
    ? getContentValue(cmsContent, `collection_${activeCollection.slug}`, "image", "")
      || activeCollection.image_url || ""
    : getContentValue(cmsContent, "hero", "image", "")
      || collections?.find((c) => c.image_url && c.visible !== false)?.image_url || "";

  const isLoading = loadingCols || loadingProducts;

  // Mobile filter toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      <SiteHeader />

      {/* ── Hero Banner with image overlay ── */}
      <section className="relative bg-secondary overflow-hidden" style={{ minHeight: '240px' }}>
        {/* Background image — same on mobile and desktop */}
        {heroImage ? (
          <img
            src={heroImage}
            alt={pageTitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        {/* Gradient overlay */}
        <div className={`absolute inset-0 ${heroImage ? "bg-gradient-to-t from-black/70 via-black/40 to-black/20" : "bg-foreground/5"}`} />

        {/* Content — visible on all screen sizes */}
        <div className="relative z-10 container py-10 md:py-20">
          <h1
            className={`text-xl md:text-4xl lg:text-5xl font-light leading-tight max-w-xl ${heroImage ? "text-white" : "text-foreground"}`}
            style={{ textTransform: 'none', letterSpacing: 'normal' }}
          >
            {pageTitle}.
          </h1>
          {pageDescription && (
            <p className={`mt-2 md:mt-3 text-xs md:text-base max-w-lg leading-relaxed ${heroImage ? "text-white/80" : "text-muted-foreground"}`}>
              {pageDescription}
            </p>
          )}
        </div>

        {/* Breadcrumb bar */}
        <div className={`relative z-10 ${heroImage ? "bg-black/30 backdrop-blur-sm" : "bg-muted/50"}`}>
          <div className="container py-2 md:py-2.5">
            <Breadcrumb
              collection={activeCollection}
              parentCollection={parentCollection}
              isAl={isAl}
              hasImage={!!heroImage}
            />
          </div>
        </div>
      </section>

      {/* ── Content: Sidebar + Products ── */}
      <section className="py-10 md:py-14 flex-1">
        <div className="container">
          {/* Mobile filter toggle button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-2 text-xs tracking-brand uppercase text-foreground border border-border rounded px-4 py-2.5 mb-6 hover:bg-muted/50 transition-colors"
          >
            {isAl ? "Filtra" : "Filters"}
            <ChevronRight
              size={14}
              className={`transition-transform ${showMobileFilters ? "rotate-90" : ""}`}
            />
          </button>

          <div className="flex flex-col md:flex-row gap-8 md:gap-10 lg:gap-14">
            {/* Sidebar */}
            <aside
              className={`md:w-52 lg:w-60 shrink-0 ${
                showMobileFilters ? "block" : "hidden md:block"
              }`}
            >
              <div className="md:sticky md:top-28">
                <FilterSidebar
                  collections={collections || []}
                  activeSlug={slug}
                  isAl={isAl}
                  allColors={allColors || []}
                  allSizes={allSizes || []}
                  compositions={compositions}
                  selectedColors={selectedColors}
                  selectedSizes={selectedSizes}
                  selectedCompositions={selectedCompositions}
                  onToggleColor={toggleColor}
                  onToggleSize={toggleSize}
                  onToggleComposition={toggleComposition}
                />
              </div>
            </aside>

            {/* Product grid */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-sm text-muted-foreground">
                    {isAl
                      ? "Nuk u gjetën produkte në këtë koleksion."
                      : "No products found in this collection."}
                  </p>
                  {(selectedColors.length > 0 || selectedSizes.length > 0 || selectedCompositions.length > 0) && (
                    <button
                      onClick={() => {
                        setSelectedColors([]);
                        setSelectedSizes([]);
                        setSelectedCompositions([]);
                      }}
                      className="mt-4 text-xs tracking-brand uppercase text-primary hover:underline"
                    >
                      {isAl ? "Pastro filtrat" : "Clear filters"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      collectionSlug={getCollectionSlug(product)}
                      isAl={isAl}
                      productColors={allColors}
                      assignments={allAssignments}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Collections;
