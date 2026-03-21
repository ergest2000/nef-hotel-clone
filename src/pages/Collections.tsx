import { useState, useMemo } from "react";
import { useCollections, useProducts, useProductImages, useAllProductColors, useAllProductSizes, type ProductColor, type ProductSize } from "@/hooks/useCollections";
import { useLanguage } from "@/hooks/useLanguage";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Filter, ChevronRight, Package, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";

// Product image gallery sub-component
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
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <Package className="h-20 w-20 text-muted-foreground/20" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
        <img src={allImages[selected]} alt="" className="w-full h-full object-cover" />
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
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

const Collections = () => {
  const { lang, isAl } = useLanguage();
  const { slug } = useParams();
  const { data: collections } = useCollections();
  const { data: allProducts } = useProducts();
  const { data: allColors } = useAllProductColors();
  const { data: allSizes } = useAllProductSizes();

  const [colorFilter, setColorFilter] = useState<string>("");
  const [sizeFilter, setSizeFilter] = useState<string>("");
  const [compositionFilter, setCompositionFilter] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

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

  // Build color options from product_colors for current products
  const productIds = useMemo(() => products.map(p => p.id), [products]);

  const colorOptions = useMemo(() => {
    if (!allColors) return [];
    const relevant = allColors.filter(c => productIds.includes(c.product_id));
    const unique = new Map<string, ProductColor>();
    relevant.forEach(c => { if (!unique.has(c.color_name)) unique.set(c.color_name, c); });
    return Array.from(unique.values());
  }, [allColors, productIds]);

  const sizeOptions = useMemo(() => {
    if (!allSizes) return [];
    const relevant = allSizes.filter(s => productIds.includes(s.product_id));
    const unique = new Set<string>();
    return relevant.filter(s => { if (unique.has(s.size_label)) return false; unique.add(s.size_label); return true; });
  }, [allSizes, productIds]);

  const compositionOptions = useMemo(() => {
    const comps = products.map((p) => isAl ? p.composition_al : p.composition_en).filter(Boolean);
    return [...new Set(comps)];
  }, [products, isAl]);

  // Apply filters
  const filtered = useMemo(() => {
    let list = products;
    if (colorFilter && allColors) {
      const matchingProductIds = new Set(allColors.filter(c => c.color_name === colorFilter).map(c => c.product_id));
      list = list.filter(p => matchingProductIds.has(p.id));
    }
    if (sizeFilter && allSizes) {
      const matchingProductIds = new Set(allSizes.filter(s => s.size_label === sizeFilter).map(s => s.product_id));
      list = list.filter(p => matchingProductIds.has(p.id));
    }
    if (compositionFilter) list = list.filter((p) => (isAl ? p.composition_al : p.composition_en) === compositionFilter);
    return list;
  }, [products, colorFilter, sizeFilter, compositionFilter, isAl, allColors, allSizes]);

  const t = (al: string, en: string) => isAl ? al : en;
  const hasActiveFilters = colorFilter || sizeFilter || compositionFilter;

  // No slug - show all collections
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
                <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden mb-3">
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

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">{t("Kryesore", "Home")}</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/koleksionet" className="hover:text-foreground">{t("Koleksionet", "Collections")}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{isAl ? currentCollection.title_al : currentCollection.title_en}</span>
        </div>

        {/* Collection Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-wide text-foreground">
            {isAl ? currentCollection.title_al : currentCollection.title_en}
          </h1>
          {(isAl ? currentCollection.description_al : currentCollection.description_en) && (
            <p className="text-muted-foreground mt-2 max-w-2xl">
              {isAl ? currentCollection.description_al : currentCollection.description_en}
            </p>
          )}
        </div>

        {/* Sub-collections */}
        {subCollections.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {subCollections.map((sub) => (
              <Link key={sub.id} to={`/koleksionet/${sub.slug}`}>
                <Badge variant="outline" className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  {isAl ? sub.title_al : sub.title_en}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
            >
              <Filter className="h-4 w-4" />
              {t("Filtra", "Filters")}
              {hasActiveFilters && <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">!</Badge>}
            </button>

            {showFilters && (
              <>
                {colorOptions.length > 0 && (
                  <Select value={colorFilter} onValueChange={(v) => setColorFilter(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-40 h-9 text-xs">
                      <SelectValue placeholder={t("NGJYRA", "COLOR")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("Të gjitha", "All")}</SelectItem>
                      {colorOptions.map((c) => (
                        <SelectItem key={c.color_name} value={c.color_name}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: c.color_hex }} />
                            {c.color_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {sizeOptions.length > 0 && (
                  <Select value={sizeFilter} onValueChange={(v) => setSizeFilter(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-40 h-9 text-xs">
                      <SelectValue placeholder={t("PËRMASA", "SIZE")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("Të gjitha", "All")}</SelectItem>
                      {sizeOptions.map((s) => (
                        <SelectItem key={s.size_label} value={s.size_label}>{s.size_label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {compositionOptions.length > 0 && (
                  <Select value={compositionFilter} onValueChange={(v) => setCompositionFilter(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-48 h-9 text-xs">
                      <SelectValue placeholder={t("PËRBËRJA", "COMPOSITION")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("Të gjitha", "All")}</SelectItem>
                      {compositionOptions.map((c) => (
                        <SelectItem key={c} value={c!}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                    setColorFilter("");
                    setSizeFilter("");
                    setCompositionFilter("");
                  }}>
                    <X className="h-3 w-3 mr-1" /> {t("Pastro", "Clear")}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isAl={isAl}
              allColors={allColors}
              allSizes={allSizes}
              onClick={() => setSelectedProduct(product)}
              t={t}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">{t("Nuk u gjetën produkte", "No products found")}</p>
          </div>
        )}
      </div>

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

// Product card component
const ProductCard = ({ product, isAl, allColors, allSizes, onClick, t }: {
  product: any; isAl: boolean; allColors?: ProductColor[]; allSizes?: ProductSize[];
  onClick: () => void; t: (al: string, en: string) => string;
}) => {
  const productColors = allColors?.filter(c => c.product_id === product.id) ?? [];

  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-2">
        {product.image_url ? (
          <img src={product.image_url} alt={isAl ? product.title_al : product.title_en}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-10 w-10 text-muted-foreground/20" />
          </div>
        )}
        {product.customizable && (
          <div className="absolute top-2 left-2">
            <Badge className="text-[10px] bg-primary/90">{t("Personalizuar", "Customizable")}</Badge>
          </div>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <Badge variant="destructive">{t("Jo në stok", "Out of stock")}</Badge>
          </div>
        )}
      </div>
      <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
        {isAl ? product.title_al : product.title_en}
      </h4>
      {productColors.length > 0 && (
        <div className="flex items-center gap-1 mt-1">
          {productColors.slice(0, 5).map(c => (
            <div key={c.id} className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: c.color_hex }} title={c.color_name} />
          ))}
          {productColors.length > 5 && <span className="text-[10px] text-muted-foreground">+{productColors.length - 5}</span>}
        </div>
      )}
      <span className="text-xs text-muted-foreground">
        {isAl ? product.composition_al : product.composition_en}
      </span>
    </div>
  );
};

// Product detail view
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
            <p className="text-foreground mt-2">
              {isAl ? product.description_al : product.description_en}
            </p>
          </div>

          {/* Color swatches */}
          {productColors.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">{t("Ngjyrat", "Colors")}</p>
              <div className="flex flex-wrap gap-2">
                {productColors.map(c => (
                  <div key={c.id} className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded text-xs">
                    <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: c.color_hex }} />
                    {c.color_name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
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

          {/* Specs table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {(product.weight_gsm ?? 0) > 0 && (
                  <tr className="border-b">
                    <td className="px-3 py-2 bg-muted/50 font-medium w-1/2">{t("Pesha", "Weight")}</td>
                    <td className="px-3 py-2">{product.weight_gsm} gsm</td>
                  </tr>
                )}
                <tr className="border-b">
                  <td className="px-3 py-2 bg-muted/50 font-medium">{t("Përbërja", "Composition")}</td>
                  <td className="px-3 py-2">{isAl ? product.composition_al : product.composition_en}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-3 py-2 bg-muted/50 font-medium">{t("Dimensionet", "Dimensions")}</td>
                  <td className="px-3 py-2">{isAl ? product.dimensions_al : product.dimensions_en}</td>
                </tr>
                {(product.box_quantity ?? 0) > 0 && (
                  <tr className="border-b">
                    <td className="px-3 py-2 bg-muted/50 font-medium">{t("Kuti", "Box")}</td>
                    <td className="px-3 py-2">{product.box_quantity}</td>
                  </tr>
                )}
                {(product.pieces_per_box ?? 0) > 0 && (
                  <tr>
                    <td className="px-3 py-2 bg-muted/50 font-medium">{t("Copë / Kuti", "Pieces / Box")}</td>
                    <td className="px-3 py-2">{product.pieces_per_box}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Stock + Customizable */}
          <div className="flex gap-3">
            <Badge variant={product.in_stock ? "default" : "destructive"}>
              {product.in_stock ? t("Në stok", "In stock") : t("Jo në stok", "Out of stock")}
            </Badge>
            {product.customizable && (
              <Badge variant="outline">{t("I personalizueshëm", "Customizable")}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Accordion info sections */}
      <Accordion type="multiple" className="mt-6">
        {(isAl ? product.product_info_al : product.product_info_en) && (
          <AccordionItem value="info">
            <AccordionTrigger>{t("Informacion mbi Produktin", "Product Information")}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {isAl ? product.product_info_al : product.product_info_en}
              </p>
            </AccordionContent>
          </AccordionItem>
        )}
        {(isAl ? product.return_policy_al : product.return_policy_en) && (
          <AccordionItem value="returns">
            <AccordionTrigger>{t("Politika e Kthimit", "Returns Policy")}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {isAl ? product.return_policy_al : product.return_policy_en}
              </p>
            </AccordionContent>
          </AccordionItem>
        )}
        {(isAl ? product.tech_specs_al : product.tech_specs_en) && (
          <AccordionItem value="specs">
            <AccordionTrigger>{t("Specifikimet Teknike", "Technical Specifications")}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {isAl ? product.tech_specs_al : product.tech_specs_en}
              </p>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </>
  );
};

export default Collections;
