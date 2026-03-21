import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useCollections, useProducts, useProductImages,
  useAllProductColors, useAllProductSizes,
  type ProductColor, type ProductSize,
} from "@/hooks/useCollections";
import { useLanguage } from "@/hooks/useLanguage";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronRight, ChevronLeft, Package, Heart, Filter, X } from "lucide-react";

const ITEMS_PER_PAGE = 9;

// ─── Product Image Gallery (for dialog) ─────────────────────────
const ProductImageGallery = ({ mainImage, productId }: { mainImage?: string | null; productId: string }) => {
  const { data: extraImages } = useProductImages(productId);
  const allImages = useMemo(() => {
    const imgs: string[] = [];
    if (mainImage) imgs.push(mainImage);
    extraImages?.forEach((img) => {
      if (img.image_url && !imgs.includes(img.image_url)) imgs.push(img.image_url);
    });
    return imgs;
  }, [mainImage, extraImages]);

  const [selected, setSelected] = useState(0);

  if (!allImages.length) {
    return (
      <div className="aspect-square bg-muted flex items-center justify-center">
        <Package className="h-20 w-20 text-muted-foreground/20" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-square bg-muted overflow-hidden">
        <img src={allImages[selected]} alt="" className="w-full h-full object-cover" />
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition-colors ${
                i === selected ? "border-primary" : "border-transparent hover:border-border"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Product Card ────────────────────────────────────────────────
const ProductCard = ({ product, isAl, allColors, collectionSlug, t }: {
  product: any; isAl: boolean; allColors?: ProductColor[];
  collectionSlug: string; t: (al: string, en: string) => string;
}) => {
  const productColors = allColors?.filter(c => c.product_id === product.id) ?? [];
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <div className="group">
      <Link to={`/koleksionet/${collectionSlug}/${product.id}`} className="relative aspect-[4/5] bg-muted overflow-hidden mb-3 block">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={isAl ? product.title_al : product.title_en}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}
        {/* Wishlist button */}
        <button
          className="absolute top-3 right-3 z-10"
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${wishlisted ? "fill-primary text-primary" : "text-muted-foreground/60 hover:text-primary"}`}
          />
        </button>
        {/* Stock overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <span className="text-sm font-medium text-foreground">{t("Jo në stok", "Out of stock")}</span>
          </div>
        )}
        {product.customizable && (
          <div className="absolute bottom-2 left-2">
            <Badge className="text-[10px] bg-primary/90">{t("Personalizuar", "Customizable")}</Badge>
          </div>
        )}
      </Link>
      <Link to={`/koleksionet/${collectionSlug}/${product.id}`} className="block">
        <h4 className="text-sm font-semibold text-foreground leading-tight">
          {isAl ? product.title_al : product.title_en}
        </h4>
        {product.weight_gsm > 0 && (
          <p className="text-sm font-medium text-foreground mt-0.5">
            {product.code} {product.weight_gsm}gsm
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {isAl ? product.composition_al : product.composition_en}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("Dimensioni:", "Dimension:")} {isAl ? product.dimensions_al : product.dimensions_en}
        </p>
      </Link>
      {/* Color swatches */}
      {productColors.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2">
          {productColors.map(c => (
            <div
              key={c.id}
              className="w-4 h-4 rounded-full border border-border cursor-pointer hover:ring-2 hover:ring-primary/30"
              style={{ backgroundColor: c.color_hex }}
              title={c.color_name}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Product Detail View ─────────────────────────────────────────
const ProductDetailView = ({ product, isAl, t, allColors, allSizes }: {
  product: any; isAl: boolean; t: (al: string, en: string) => string;
  allColors?: ProductColor[]; allSizes?: ProductSize[];
}) => {
  const productColors = allColors?.filter(c => c.product_id === product.id) ?? [];
  const productSizes = allSizes?.filter(s => s.product_id === product.id) ?? [];

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-light">
          {isAl ? product.title_al : product.title_en}
        </DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <ProductImageGallery mainImage={product.image_url} productId={product.id} />
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{t("Kodi", "Code")} {product.code}</p>
            <p className="text-foreground mt-2">{isAl ? product.description_al : product.description_en}</p>
          </div>
          {productColors.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">{t("Ngjyrat", "Colors")}</p>
              <div className="flex flex-wrap gap-2">
                {productColors.map(c => (
                  <div key={c.id} className="flex items-center gap-1.5 px-2 py-1 bg-muted text-xs">
                    <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: c.color_hex }} />
                    {c.color_name}
                  </div>
                ))}
              </div>
            </div>
          )}
          {productSizes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">{t("Përmasat", "Sizes")}</p>
              <div className="flex flex-wrap gap-2">
                {productSizes.map(s => (
                  <Badge key={s.id} variant="outline" className="text-xs">{s.size_label}</Badge>
                ))}
              </div>
            </div>
          )}
          <div className="border overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {(product.weight_gsm ?? 0) > 0 && (
                  <tr className="border-b"><td className="px-3 py-2 bg-muted/50 font-medium w-1/2">{t("Pesha", "Weight")}</td><td className="px-3 py-2">{product.weight_gsm} gsm</td></tr>
                )}
                <tr className="border-b"><td className="px-3 py-2 bg-muted/50 font-medium">{t("Përbërja", "Composition")}</td><td className="px-3 py-2">{isAl ? product.composition_al : product.composition_en}</td></tr>
                <tr className="border-b"><td className="px-3 py-2 bg-muted/50 font-medium">{t("Dimensionet", "Dimensions")}</td><td className="px-3 py-2">{isAl ? product.dimensions_al : product.dimensions_en}</td></tr>
                {(product.box_quantity ?? 0) > 0 && (
                  <tr className="border-b"><td className="px-3 py-2 bg-muted/50 font-medium">{t("Kuti", "Box")}</td><td className="px-3 py-2">{product.box_quantity}</td></tr>
                )}
                {(product.pieces_per_box ?? 0) > 0 && (
                  <tr><td className="px-3 py-2 bg-muted/50 font-medium">{t("Copë / Kuti", "Pieces / Box")}</td><td className="px-3 py-2">{product.pieces_per_box}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3">
            <Badge variant={product.in_stock ? "default" : "destructive"}>
              {product.in_stock ? t("Në stok", "In stock") : t("Jo në stok", "Out of stock")}
            </Badge>
            {product.customizable && <Badge variant="outline">{t("I personalizueshëm", "Customizable")}</Badge>}
          </div>
        </div>
      </div>
      <Accordion type="multiple" className="mt-6">
        {(isAl ? product.product_info_al : product.product_info_en) && (
          <AccordionItem value="info">
            <AccordionTrigger>{t("Informacion mbi Produktin", "Product Information")}</AccordionTrigger>
            <AccordionContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{isAl ? product.product_info_al : product.product_info_en}</p></AccordionContent>
          </AccordionItem>
        )}
        {(isAl ? product.return_policy_al : product.return_policy_en) && (
          <AccordionItem value="returns">
            <AccordionTrigger>{t("Politika e Kthimit", "Returns Policy")}</AccordionTrigger>
            <AccordionContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{isAl ? product.return_policy_al : product.return_policy_en}</p></AccordionContent>
          </AccordionItem>
        )}
        {(isAl ? product.tech_specs_al : product.tech_specs_en) && (
          <AccordionItem value="specs">
            <AccordionTrigger>{t("Specifikimet Teknike", "Technical Specifications")}</AccordionTrigger>
            <AccordionContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{isAl ? product.tech_specs_al : product.tech_specs_en}</p></AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </>
  );
};

// ─── Sidebar Filter Section ─────────────────────────────────────
const FilterSection = ({ title, options, selected, onToggle }: {
  title: string;
  options: { value: string; label: string; hex?: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) => {
  if (!options.length) return null;
  return (
    <div className="border-b border-border pb-4 mb-4">
      <h4 className="text-xs font-bold tracking-wider text-foreground uppercase mb-3">{title}</h4>
      <div className="space-y-2">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
            <Checkbox
              checked={selected.includes(opt.value)}
              onCheckedChange={() => onToggle(opt.value)}
              className="h-4 w-4"
            />
            {opt.hex && (
              <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: opt.hex }} />
            )}
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

// ─── Main Collections Page ───────────────────────────────────────
const Collections = () => {
  const { isAl } = useLanguage();
  const { slug } = useParams();
  const { data: collections } = useCollections();
  const { data: allProducts } = useProducts();
  const { data: allColors } = useAllProductColors();
  const { data: allSizes } = useAllProductSizes();

  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [sizeFilters, setSizeFilters] = useState<string[]>([]);
  const [compositionFilters, setCompositionFilters] = useState<string[]>([]);
  const [stockFilter, setStockFilter] = useState<string[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const currentCollection = collections?.find((c) => c.slug === slug);
  const topCollections = collections?.filter((c) => !c.parent_id) ?? [];
  const subCollections = currentCollection
    ? collections?.filter((c) => c.parent_id === currentCollection.id) ?? []
    : [];

  const collectionIds = currentCollection
    ? [currentCollection.id, ...subCollections.map((s) => s.id)]
    : [];

  const products = useMemo(() => {
    if (!allProducts || !collectionIds.length) return allProducts ?? [];
    return allProducts.filter((p) => collectionIds.includes(p.collection_id));
  }, [allProducts, collectionIds]);

  const productIds = useMemo(() => products.map(p => p.id), [products]);

  const t = (al: string, en: string) => isAl ? al : en;

  // Build filter options
  const colorOptions = useMemo(() => {
    if (!allColors) return [];
    const relevant = allColors.filter(c => productIds.includes(c.product_id));
    const unique = new Map<string, ProductColor>();
    relevant.forEach(c => { if (!unique.has(c.color_name)) unique.set(c.color_name, c); });
    return Array.from(unique.values()).map(c => ({ value: c.color_name, label: c.color_name, hex: c.color_hex }));
  }, [allColors, productIds]);

  const sizeOptions = useMemo(() => {
    if (!allSizes) return [];
    const relevant = allSizes.filter(s => productIds.includes(s.product_id));
    const unique = new Set<string>();
    return relevant.filter(s => { if (unique.has(s.size_label)) return false; unique.add(s.size_label); return true; })
      .map(s => ({ value: s.size_label, label: s.size_label }));
  }, [allSizes, productIds]);

  const compositionOptions = useMemo(() => {
    const comps = products.map((p) => isAl ? p.composition_al : p.composition_en).filter(Boolean) as string[];
    return [...new Set(comps)].map(c => ({ value: c, label: c }));
  }, [products, isAl]);

  const toggleFilter = (arr: string[], setArr: (v: string[]) => void) => (value: string) => {
    setArr(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
    setCurrentPage(1);
  };

  // Apply filters
  const filtered = useMemo(() => {
    let list = products;
    if (colorFilters.length && allColors) {
      const ids = new Set(allColors.filter(c => colorFilters.includes(c.color_name)).map(c => c.product_id));
      list = list.filter(p => ids.has(p.id));
    }
    if (sizeFilters.length && allSizes) {
      const ids = new Set(allSizes.filter(s => sizeFilters.includes(s.size_label)).map(s => s.product_id));
      list = list.filter(p => ids.has(p.id));
    }
    if (compositionFilters.length) {
      list = list.filter(p => compositionFilters.includes((isAl ? p.composition_al : p.composition_en) ?? ""));
    }
    if (stockFilter.includes("in_stock")) list = list.filter(p => p.in_stock);
    if (stockFilter.includes("out_of_stock")) list = list.filter(p => !p.in_stock);
    return list;
  }, [products, colorFilters, sizeFilters, compositionFilters, stockFilter, isAl, allColors, allSizes]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const hasActiveFilters = colorFilters.length || sizeFilters.length || compositionFilters.length || stockFilter.length;

  const clearAllFilters = () => {
    setColorFilters([]);
    setSizeFilters([]);
    setCompositionFilters([]);
    setStockFilter([]);
    setCurrentPage(1);
  };

  // Sidebar filter content (shared between desktop & mobile)
  const filtersContent = (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">{t("Filtra", "Filters")}</h3>
        {hasActiveFilters ? (
          <button onClick={clearAllFilters} className="text-xs text-primary hover:underline">
            {t("Pastro", "Clear")}
          </button>
        ) : null}
      </div>
      <FilterSection
        title={t("NGJYRA", "COLOR")}
        options={colorOptions}
        selected={colorFilters}
        onToggle={toggleFilter(colorFilters, setColorFilters)}
      />
      <FilterSection
        title={t("PËRBËRJA", "COMPOSITION")}
        options={compositionOptions}
        selected={compositionFilters}
        onToggle={toggleFilter(compositionFilters, setCompositionFilters)}
      />
      <FilterSection
        title={t("DIMENSIONI", "DIMENSION")}
        options={sizeOptions}
        selected={sizeFilters}
        onToggle={toggleFilter(sizeFilters, setSizeFilters)}
      />
      <FilterSection
        title={t("STATUSI", "STATUS")}
        options={[
          { value: "in_stock", label: t("Në stok", "In stock") },
          { value: "out_of_stock", label: t("Jo në stok", "Out of stock") },
        ]}
        selected={stockFilter}
        onToggle={toggleFilter(stockFilter, setStockFilter)}
      />
    </>
  );

  // ─── Collections listing (no slug) ───
  if (!slug || !currentCollection) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-light tracking-wide text-foreground mb-8">
            {t("Koleksionet", "Collections")}
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {topCollections.map((col) => (
              <Link key={col.id} to={`/koleksionet/${col.slug}`} className="group">
                <div className="aspect-[4/3] bg-muted overflow-hidden mb-3">
                  {col.image_url ? (
                    <img src={col.image_url} alt={isAl ? col.title_al : col.title_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-16 w-16 text-muted-foreground/20" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                  {isAl ? col.title_al : col.title_en}
                </h3>
                {(isAl ? col.description_al : col.description_en) && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {isAl ? col.description_al : col.description_en}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  // ─── Collection detail page ───
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Cover Banner */}
      <div className="relative w-full h-[280px] md:h-[380px] overflow-hidden">
        {currentCollection.image_url ? (
          <img
            src={currentCollection.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-light text-white tracking-wide">
            {isAl ? currentCollection.title_al : currentCollection.title_en}.
          </h1>
          {(isAl ? currentCollection.description_al : currentCollection.description_en) && (
            <p className="text-white/80 mt-2 max-w-xl text-sm md:text-base leading-relaxed">
              {isAl ? currentCollection.description_al : currentCollection.description_en}
            </p>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
            <Link to="/" className="hover:text-foreground">{t("KRYESORE", "HOME")}</Link>
            <span>-</span>
            {/* Show parent collection in breadcrumb if this is a sub-collection */}
            {currentCollection.parent_id && (() => {
              const parent = collections?.find(c => c.id === currentCollection.parent_id);
              return parent ? (
                <>
                  <Link to={`/koleksionet/${parent.slug}`} className="hover:text-foreground">
                    {(isAl ? parent.title_al : parent.title_en).toUpperCase()}
                  </Link>
                  <span>-</span>
                </>
              ) : null;
            })()}
            <span className="text-foreground">
              {(isAl ? currentCollection.title_al : currentCollection.title_en).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-collections */}
      {subCollections.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-4 border-b border-border">
          <div className="flex flex-wrap gap-2">
            {subCollections.map((sub) => (
              <Link key={sub.id} to={`/koleksionet/${sub.slug}`}>
                <Badge variant="outline" className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  {isAl ? sub.title_al : sub.title_en}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main content: sidebar + products */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile filter button */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full justify-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {t("Filtra", "Filters")}
            {hasActiveFilters ? ` (${colorFilters.length + sizeFilters.length + compositionFilters.length + stockFilter.length})` : ""}
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-[220px] flex-shrink-0">
            {filtersContent}
          </aside>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">{t("Nuk u gjetën produkte", "No products found")}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isAl={isAl}
                      allColors={allColors}
                      collectionSlug={slug ?? ""}
                      t={t}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-end gap-2 mt-12 pt-6 border-t border-border">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={`w-8 h-8 flex items-center justify-center text-sm transition-colors ${
                          page === currentPage
                            ? "text-foreground font-semibold underline underline-offset-4"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    {currentPage < totalPages && (
                      <>
                        <button
                          onClick={() => { setCurrentPage(currentPage + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className="text-muted-foreground hover:text-foreground text-sm"
                        >
                          ›
                        </button>
                        <button
                          onClick={() => { setCurrentPage(totalPages); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className="text-muted-foreground hover:text-foreground text-sm"
                        >
                          »
                        </button>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Filtra", "Filters")}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">{filtersContent}</div>
          <Button className="w-full mt-4" onClick={() => setMobileFiltersOpen(false)}>
            {t("Shiko rezultatet", "Show results")} ({filtered.length})
          </Button>
        </DialogContent>
      </Dialog>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <ProductDetailView product={selectedProduct} isAl={isAl} t={t} allColors={allColors} allSizes={allSizes} />
          )}
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  );
};

export default Collections;
