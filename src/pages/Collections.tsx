import { useState, useMemo } from "react";
import { useCollections, useProducts } from "@/hooks/useCollections";
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

const Collections = () => {
  const { lang, isAl } = useLanguage();
  const { slug } = useParams();
  const { data: collections } = useCollections();
  const { data: allProducts } = useProducts();

  const [colorFilter, setColorFilter] = useState<string>("");
  const [compositionFilter, setCompositionFilter] = useState<string>("");
  const [dimensionFilter, setDimensionFilter] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Find current collection by slug
  const currentCollection = collections?.find((c) => c.slug === slug);
  const topCollections = collections?.filter((c) => !c.parent_id) ?? [];

  // Get sub-collections for current
  const subCollections = currentCollection
    ? collections?.filter((c) => c.parent_id === currentCollection.id) ?? []
    : [];

  // Products for this collection (and its sub-collections)
  const collectionIds = currentCollection
    ? [currentCollection.id, ...subCollections.map((s) => s.id)]
    : [];

  const products = useMemo(() => {
    if (!allProducts || !collectionIds.length) return allProducts ?? [];
    return allProducts.filter((p) => collectionIds.includes(p.collection_id));
  }, [allProducts, collectionIds]);

  // Unique filter options
  const colorOptions = useMemo(() => {
    const colors = products.map((p) => p.color).filter(Boolean);
    return [...new Set(colors)];
  }, [products]);

  const compositionOptions = useMemo(() => {
    const comps = products.map((p) => isAl ? p.composition_al : p.composition_en).filter(Boolean);
    return [...new Set(comps)];
  }, [products, isAl]);

  const dimensionOptions = useMemo(() => {
    const dims = products.map((p) => isAl ? p.dimensions_al : p.dimensions_en).filter(Boolean);
    return [...new Set(dims)];
  }, [products, isAl]);

  // Apply filters
  const filtered = useMemo(() => {
    let list = products;
    if (colorFilter) list = list.filter((p) => p.color === colorFilter);
    if (compositionFilter) list = list.filter((p) => (isAl ? p.composition_al : p.composition_en) === compositionFilter);
    if (dimensionFilter) list = list.filter((p) => (isAl ? p.dimensions_al : p.dimensions_en) === dimensionFilter);
    return list;
  }, [products, colorFilter, compositionFilter, dimensionFilter, isAl]);

  const t = (al: string, en: string) => isAl ? al : en;
  const hasActiveFilters = colorFilter || compositionFilter || dimensionFilter;

  // If no slug, show all collections
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
              <Link
                key={col.id}
                to={`/koleksionet/${col.slug}`}
                className="group"
              >
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
                        <SelectItem key={c} value={c!}>{c}</SelectItem>
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

                {dimensionOptions.length > 0 && (
                  <Select value={dimensionFilter} onValueChange={(v) => setDimensionFilter(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-48 h-9 text-xs">
                      <SelectValue placeholder={t("DIMENSIONI", "DIMENSIONS")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("Të gjitha", "All")}</SelectItem>
                      {dimensionOptions.map((d) => (
                        <SelectItem key={d} value={d!}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                    setColorFilter("");
                    setCompositionFilter("");
                    setDimensionFilter("");
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
            <div
              key={product.id}
              className="group cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-2">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={isAl ? product.title_al : product.title_en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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
              <div className="flex items-center gap-2 mt-1">
                {product.color_hex && product.color_hex !== "#FFFFFF" && (
                  <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: product.color_hex }} />
                )}
                <span className="text-xs text-muted-foreground">
                  {isAl ? product.composition_al : product.composition_en}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAl ? product.dimensions_al : product.dimensions_en}
              </p>
            </div>
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
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-light">
                  {isAl ? selectedProduct.title_al : selectedProduct.title_en}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Image */}
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {selectedProduct.image_url ? (
                    <img src={selectedProduct.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-20 w-20 text-muted-foreground/20" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("Kodi", "Code")} {selectedProduct.code}</p>
                    <p className="text-foreground mt-2">
                      {isAl ? selectedProduct.description_al : selectedProduct.description_en}
                    </p>
                  </div>

                  {/* Specs table */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        {selectedProduct.weight_gsm > 0 && (
                          <tr className="border-b">
                            <td className="px-3 py-2 bg-muted/50 font-medium w-1/2">{t("Pesha", "Weight")}</td>
                            <td className="px-3 py-2">{selectedProduct.weight_gsm} gsm</td>
                          </tr>
                        )}
                        <tr className="border-b">
                          <td className="px-3 py-2 bg-muted/50 font-medium">{t("Përbërja", "Composition")}</td>
                          <td className="px-3 py-2">{isAl ? selectedProduct.composition_al : selectedProduct.composition_en}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-3 py-2 bg-muted/50 font-medium">{t("Dimensionet", "Dimensions")}</td>
                          <td className="px-3 py-2">{isAl ? selectedProduct.dimensions_al : selectedProduct.dimensions_en}</td>
                        </tr>
                        {selectedProduct.box_quantity > 0 && (
                          <tr className="border-b">
                            <td className="px-3 py-2 bg-muted/50 font-medium">{t("Kuti", "Box")}</td>
                            <td className="px-3 py-2">{selectedProduct.box_quantity}</td>
                          </tr>
                        )}
                        {selectedProduct.pieces_per_box > 0 && (
                          <tr>
                            <td className="px-3 py-2 bg-muted/50 font-medium">{t("Copë / Kuti", "Pieces / Box")}</td>
                            <td className="px-3 py-2">{selectedProduct.pieces_per_box}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Stock + Customizable */}
                  <div className="flex gap-3">
                    <Badge variant={selectedProduct.in_stock ? "default" : "destructive"}>
                      {selectedProduct.in_stock ? t("Në stok", "In stock") : t("Jo në stok", "Out of stock")}
                    </Badge>
                    {selectedProduct.customizable && (
                      <Badge variant="outline">{t("I personalizueshëm", "Customizable")}</Badge>
                    )}
                  </div>

                  {/* Color swatch */}
                  {selectedProduct.color && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: selectedProduct.color_hex }} />
                      <span className="text-sm">{selectedProduct.color}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Accordion info sections */}
              <Accordion type="multiple" className="mt-6">
                {(isAl ? selectedProduct.product_info_al : selectedProduct.product_info_en) && (
                  <AccordionItem value="info">
                    <AccordionTrigger>{t("Informacion mbi Produktin", "Product Information")}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {isAl ? selectedProduct.product_info_al : selectedProduct.product_info_en}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                )}
                {(isAl ? selectedProduct.return_policy_al : selectedProduct.return_policy_en) && (
                  <AccordionItem value="returns">
                    <AccordionTrigger>{t("Politika e Kthimit", "Returns Policy")}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {isAl ? selectedProduct.return_policy_al : selectedProduct.return_policy_en}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                )}
                {(isAl ? selectedProduct.tech_specs_al : selectedProduct.tech_specs_en) && (
                  <AccordionItem value="specs">
                    <AccordionTrigger>{t("Specifikimet Teknike", "Technical Specifications")}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {isAl ? selectedProduct.tech_specs_al : selectedProduct.tech_specs_en}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </>
          )}
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  );
};

export default Collections;
