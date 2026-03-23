import { useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import {
  useCollections, useProducts, useProductImages,
  useAllProductColors, useAllProductSizes,
  useWishlist, useToggleWishlist,
  type ProductColor, type ProductSize,
} from "@/hooks/useCollections";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, ShoppingBag, Package, Palette, ChevronLeft, ChevronRight, Search, X } from "lucide-react";

// ─── Image Lightbox ─────────────────────────────────────────────
const ImageLightbox = ({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) => {
  const [idx, setIdx] = useState(startIndex);
  const goPrev = () => setIdx((i) => (i > 0 ? i - 1 : images.length - 1));
  const goNext = () => setIdx((i) => (i < images.length - 1 ? i + 1 : 0));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none flex items-center justify-center">
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/40 transition-colors">
          <X className="h-5 w-5 text-white" />
        </button>
        <div className="relative w-full h-full flex items-center justify-center min-h-[60vh]">
          <img src={images[idx]} alt="" className="max-w-full max-h-[85vh] object-contain" />
          {images.length > 1 && (
            <>
              <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/40 transition-colors">
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/40 transition-colors">
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
          {idx + 1} / {images.length}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Product Image Gallery ──────────────────────────────────────
const ProductGallery = ({ mainImage, productId, onOpenLightbox }: { mainImage?: string | null; productId: string; onOpenLightbox: (images: string[], index: number) => void }) => {
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
        <Package className="h-24 w-24 text-muted-foreground/20" />
      </div>
    );
  }

  const goPrev = () => setSelected((s) => (s > 0 ? s - 1 : allImages.length - 1));
  const goNext = () => setSelected((s) => (s < allImages.length - 1 ? s + 1 : 0));

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-muted overflow-hidden group">
        <img src={allImages[selected]} alt="" className="w-full h-full object-cover" />
        {/* Zoom icon */}
        <button
          onClick={() => onOpenLightbox(allImages, selected)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
        >
          <Search className="h-4 w-4 text-foreground" />
        </button>
        {allImages.length > 1 && (
          <>
            <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </>
        )}
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden border-2 transition-colors snap-start ${
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

// ─── Related Products ───────────────────────────────────────────
const RelatedProducts = ({ collectionId, currentProductId, isAl, collectionSlug }: {
  collectionId: string; currentProductId: string; isAl: boolean; collectionSlug: string;
}) => {
  const { data: allProducts } = useProducts(collectionId);
  const related = useMemo(
    () => (allProducts ?? []).filter((p) => p.id !== currentProductId && p.visible).slice(0, 4),
    [allProducts, currentProductId]
  );

  if (!related.length) return null;

  const t = (al: string, en: string) => (isAl ? al : en);

  return (
    <section className="py-12 md:py-16 border-t border-border">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-10">
          {t("KOMBINOJE ATE ME", "COMBINE IT WITH")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {related.map((p) => (
            <Link key={p.id} to={`/koleksionet/${collectionSlug}/${p.id}`} className="group">
              <div className="aspect-square bg-muted overflow-hidden mb-3">
                {p.image_url ? (
                  <img src={p.image_url} alt={isAl ? p.title_al : p.title_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-10 w-10 text-muted-foreground/20" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {isAl ? p.title_al : p.title_en}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Main Product Detail Page ───────────────────────────────────
const ProductDetail = () => {
  const { slug, productId } = useParams();
  const { isAl } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: collections } = useCollections();
  const { data: allProducts } = useProducts();
  const { data: allColors } = useAllProductColors();
  const { data: allSizes } = useAllProductSizes();
  const { data: wishlistItems } = useWishlist(user?.id);
  const toggleWishlist = useToggleWishlist();

  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);

  const t = (al: string, en: string) => (isAl ? al : en);

  const product = allProducts?.find((p) => p.id === productId);
  const collection = collections?.find((c) => c.slug === slug);
  const parentCollection = collection?.parent_id
    ? collections?.find((c) => c.id === collection.parent_id)
    : null;

  const productColors = allColors?.filter((c) => c.product_id === productId) ?? [];
  const productSizes = allSizes?.filter((s) => s.product_id === productId) ?? [];

  const isWishlisted = wishlistItems?.some((w) => w.product_id === productId) ?? false;

  const handleWishlistClick = useCallback(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!productId) return;
    toggleWishlist.mutate({ userId: user.id, productId, isWishlisted });
  }, [user, productId, isWishlisted, navigate, toggleWishlist]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">{t("Produkti nuk u gjet", "Product not found")}</p>
            <Link to="/koleksionet" className="text-primary hover:underline text-sm mt-2 inline-block">
              {t("Kthehu te koleksionet", "Back to collections")}
            </Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider flex-wrap">
            <Link to="/" className="hover:text-foreground">{t("KRYESORE", "HOME")}</Link>
            <span>-</span>
            <Link to="/koleksionet" className="hover:text-foreground">{t("KOLEKSIONET", "COLLECTIONS")}</Link>
            {parentCollection && (
              <>
                <span>-</span>
                <Link to={`/koleksionet/${parentCollection.slug}`} className="hover:text-foreground">
                  {(isAl ? parentCollection.title_al : parentCollection.title_en).toUpperCase()}
                </Link>
              </>
            )}
            {collection && (
              <>
                <span>-</span>
                <Link to={`/koleksionet/${collection.slug}`} className="hover:text-foreground">
                  {(isAl ? collection.title_al : collection.title_en).toUpperCase()}
                </Link>
              </>
            )}
            <span>-</span>
            <span className="text-foreground">
              {(isAl ? product.title_al : product.title_en).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left: Gallery */}
          <ProductGallery
            mainImage={product.image_url}
            productId={product.id}
            onOpenLightbox={(images, index) => setLightbox({ images, index })}
          />

          {/* Right: Info */}
          <div className="space-y-6">
            {/* Title & Code */}
            <div>
              <h1 className="text-xl md:text-2xl font-light text-foreground leading-tight">
                {isAl ? product.title_al : product.title_en}
              </h1>
              {product.code && (
                <p className="text-sm text-muted-foreground mt-1">
                  {t("Kodi", "Code")} {product.code}
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-foreground leading-relaxed">
              {isAl ? product.description_al : product.description_en}
            </p>

            {/* Colors as selectable swatches */}
            {productColors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {t("Ngjyra", "Color")}
                  {selectedColorId && (
                    <span className="ml-2 font-normal normal-case text-foreground">
                      — {(() => {
                        const c = productColors.find((c) => c.id === selectedColorId);
                        return c ? (isAl ? (c.color_name_al || c.color_name) : (c.color_name_en || c.color_name)) : "";
                      })()}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-3">
                  {productColors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedColorId(selectedColorId === c.id ? null : c.id)}
                      className="flex flex-col items-center gap-1 group"
                      title={isAl ? (c.color_name_al || c.color_name) : (c.color_name_en || c.color_name)}
                    >
                      <div
                        className={`w-9 h-9 rounded-full border-2 shadow-sm transition-all ${
                          selectedColorId === c.id
                            ? "border-primary ring-2 ring-primary/30 scale-110"
                            : "border-border group-hover:border-foreground/40"
                        }`}
                        style={{ backgroundColor: c.color_hex }}
                      />
                      <span className={`text-[10px] transition-colors ${
                        selectedColorId === c.id ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}>
                        {isAl ? (c.color_name_al || c.color_name) : (c.color_name_en || c.color_name)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes as selectable chips */}
            {productSizes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {t("Përmasa", "Size")}
                  {selectedSizeId && (
                    <span className="ml-2 font-normal normal-case text-foreground">
                      — {productSizes.find((s) => s.id === selectedSizeId)?.size_label}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {productSizes.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSizeId(selectedSizeId === s.id ? null : s.id)}
                      className={`text-xs px-4 py-2 border rounded-sm transition-all ${
                        selectedSizeId === s.id
                          ? "border-primary bg-primary text-primary-foreground font-medium"
                          : "border-border text-foreground hover:border-foreground/40"
                      }`}
                    >
                      {s.size_label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Info Table - Only KUTI and COPË PËR KUTI */}
            {((product.box_quantity ?? 0) > 0 || (product.pieces_per_box ?? 0) > 0) && (
              <div className="border border-border overflow-hidden rounded-sm">
                <table className="w-full text-sm">
                  <tbody>
                    {(product.box_quantity ?? 0) > 0 && (
                      <tr className="border-b border-border last:border-b-0">
                        <td className="px-4 py-2.5 bg-muted/50 font-medium text-foreground w-1/2">
                          {t("KUTI", "BOX")}
                        </td>
                        <td className="px-4 py-2.5 text-foreground">{product.box_quantity}</td>
                      </tr>
                    )}
                    {(product.pieces_per_box ?? 0) > 0 && (
                      <tr>
                        <td className="px-4 py-2.5 bg-muted/50 font-medium text-foreground">
                          {t("COPË PËR KUTI", "PIECES PER BOX")}
                        </td>
                        <td className="px-4 py-2.5 text-foreground">{product.pieces_per_box}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Stock + Customizable indicators */}
            <div className="flex items-center gap-3 flex-wrap">
              {product.in_stock ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-green-700 bg-green-50 border border-green-200 rounded-sm px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {t("NË STOK", "IN STOCK")}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {t("NUK KA STOK", "OUT OF STOCK")}
                </div>
              )}
              {product.customizable && (
                <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-primary bg-primary/5 border border-primary/20 rounded-sm px-3 py-1.5">
                  <Palette className="h-3.5 w-3.5" />
                  {t("I PERSONALIZUESHËM", "CUSTOMIZABLE")}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Button className="w-full gap-2 rounded-sm h-12 text-sm tracking-wider" disabled={!product.in_stock}>
                <ShoppingBag className="h-4 w-4" />
                {t("SHTO NË SHPORTË", "ADD TO CART")}
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 rounded-sm h-12 text-sm tracking-wider"
                onClick={handleWishlistClick}
                disabled={toggleWishlist.isPending}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-primary text-primary" : ""}`} />
                {isWishlisted
                  ? t("HEQUR NGA TË PREFERUARAT", "REMOVE FROM WISHLIST")
                  : t("SHTO TEK TË PREFERUARAT", "ADD TO WISHLIST")}
              </Button>
            </div>

            {/* Accordion Sections */}
            <Accordion type="multiple" className="border-t border-border pt-2">
              <AccordionItem value="info">
                <AccordionTrigger className="text-sm font-semibold tracking-wider">
                  {t("INFORMACION MBI PRODUKTIN", "PRODUCT INFORMATION")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {(isAl ? product.product_info_al : product.product_info_en) ||
                      t("Informacioni do shtohet së shpejti.", "Information will be added soon.")}
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger className="text-sm font-semibold tracking-wider">
                  {t("POLITIKA E KTHIMIT", "RETURNS POLICY")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {(isAl ? product.return_policy_al : product.return_policy_en) ||
                      t("Politika e kthimit do shtohet së shpejti.", "Returns policy will be added soon.")}
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="specs">
                <AccordionTrigger className="text-sm font-semibold tracking-wider">
                  {t("SPECIFIKIMET TEKNIKE", "TECHNICAL SPECIFICATIONS")}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    {(product.weight_gsm ?? 0) > 0 && (
                      <p><span className="font-medium text-foreground">{t("Pesha:", "Weight:")}</span> {product.weight_gsm} gsm</p>
                    )}
                    {(isAl ? product.composition_al : product.composition_en) && (
                      <p><span className="font-medium text-foreground">{t("Përbërja:", "Composition:")}</span> {isAl ? product.composition_al : product.composition_en}</p>
                    )}
                    {(isAl ? product.dimensions_al : product.dimensions_en) && (
                      <p><span className="font-medium text-foreground">{t("Dimensionet:", "Dimensions:")}</span> {isAl ? product.dimensions_al : product.dimensions_en}</p>
                    )}
                    {productColors.length > 0 && (
                      <p>
                        <span className="font-medium text-foreground">{t("Ngjyrat:", "Colors:")}</span>{" "}
                        {productColors.map((c) => isAl ? (c.color_name_al || c.color_name) : (c.color_name_en || c.color_name)).join(", ")}
                      </p>
                    )}
                    {productSizes.length > 0 && (
                      <p>
                        <span className="font-medium text-foreground">{t("Përmasat:", "Sizes:")}</span>{" "}
                        {productSizes.map((s) => s.size_label).join(", ")}
                      </p>
                    )}
                    {(isAl ? product.tech_specs_al : product.tech_specs_en) && (
                      <p className="whitespace-pre-wrap mt-2">{isAl ? product.tech_specs_al : product.tech_specs_en}</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {collection && (
        <RelatedProducts
          collectionId={product.collection_id}
          currentProductId={product.id}
          isAl={isAl}
          collectionSlug={slug ?? ""}
        />
      )}

      {/* Lightbox */}
      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}

      <SiteFooter />
    </div>
  );
};

export default ProductDetail;
