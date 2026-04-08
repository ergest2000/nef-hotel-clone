import { useState, useMemo, useCallback, useEffect } from "react";
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
import { Heart, ShoppingBag, Package, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useDesign } from "@/hooks/useDesignSettings";
import ProductColorPicker from "@/components/ProductColorPicker";

/* Default SVG icon for "Customizable" badge — overridable from Dashboard > Design Settings > customizable_icon_url */
const DefaultCustomizeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 297 297" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="m228.419,111.09c6.161-5.378 8.697-14.212 5.682-22.319l-9.293-24.992h56.01c5.257,0 9.519-4.262 9.519-9.519s-4.262-9.519-9.519-9.519h-57.055c-1.993,0-3.97,0.098-5.928,0.285l-.156-.42c-1.884-5.068-5.63-9.1-10.546-11.35-4.916-2.252-10.415-2.452-15.482-0.569-5.068,1.884-9.1,5.63-11.35,10.546-2.252,4.916-2.454,10.415-0.569,15.484l1.264,3.4c-0.208,0.203-0.424,0.394-0.63,0.6l-18.922,18.922c-5.872,5.873-13.68,9.108-21.985,9.108-8.305,0-16.113-3.234-21.985-9.108l-17.998-17.996v-56.504c0-3.943-3.196-7.139-7.139-7.139h-78.534c-3.944,0-7.14,3.196-7.14,7.139v282.721c0,3.943 3.196,7.139 7.139,7.139h78.534c3.943,0 7.139-3.196 7.139-7.139v-10.811l1.836,1.836c1.859,1.858 4.295,2.788 6.731,2.788 2.437,0 4.872-0.93 6.731-2.788 3.718-3.718 3.718-9.745 0-13.463l-15.299-15.299v-20.195l1.836,1.836c1.859,1.858 4.295,2.788 6.731,2.788 2.437,0 4.872-0.93 6.731-2.788 3.718-3.718 3.718-9.745 0-13.463l-15.299-15.299v-20.195l1.836,1.836c1.859,1.858 4.295,2.788 6.731,2.788 2.437,0 4.872-0.93 6.731-2.788 3.718-3.718 3.718-9.745 0-13.463l-15.299-15.299v-20.195l1.836,1.836c1.859,1.858 4.295,2.788 6.731,2.788 2.437,0 4.872-0.93 6.731-2.788 3.718-3.717 3.718-9.745 0-13.463l-15.299-15.299v-20.192l4.533,4.533c9.469,9.468 22.058,14.683 35.448,14.683 13.39,0 25.979-5.215 35.448-14.683l13.38-13.38 7.868,21.16c3.015,8.107 10.705,13.139 18.883,13.185l59.09,158.911c1.069,2.875 3.795,4.653 6.692,4.653 0.826,0 1.667-0.144 2.488-0.45 3.695-1.374 5.578-5.484 4.203-9.18l-59.085-158.91zm-143.222-14.606l-17.543-17.542c-3.719-3.717-9.744-3.717-13.463,0-3.717,3.718-3.717,9.745 0,13.463l31.005,31.005v20.195l-17.543-17.543c-3.719-3.717-9.744-3.717-13.463,0-3.717,3.718-3.717,9.745 0,13.463l31.005,31.005v20.195l-17.543-17.543c-3.719-3.717-9.744-3.717-13.463,0-3.717,3.718-3.717,9.745 0,13.463l31.005,31.005v20.195l-17.543-17.543c-3.719-3.717-9.744-3.717-13.463,0-3.717,3.718-3.717,9.745 0,13.463l31.005,31.005v17.951h-64.251v-268.442h64.255v35.085l-17.543-17.542c-3.719-3.717-9.744-3.717-13.463,0-3.717,3.718-3.717,9.745 0,13.463l31.006,31.005v20.194zm108.084-47.307c0.663-1.448 1.851-2.552 3.346-3.108 0.677-0.252 1.38-0.377 2.081-0.377 0.845,0 1.688,0.182 2.479,0.545 0.943,0.432 1.719,1.104 2.314,1.921-3.678,1.282-7.221,2.919-10.594,4.888-0.311-1.292-0.188-2.642 0.374-3.869zm16.255,48.727l-9.886-26.587c3.316-2.308 6.923-4.113 10.728-5.376l10.339,27.806c1.146,3.083-0.429,6.523-3.512,7.67-3.085,1.147-6.521-0.429-7.669-3.513z"/>
  </svg>
);

/* Customizable icon — reads from Dashboard, falls back to default SVG */
const CustomizeIcon = ({ className }: { className?: string }) => {
  const { settings } = useDesign();
  const iconUrl = settings["customizable_icon_url"];
  if (iconUrl) {
    return <img src={iconUrl} alt="" className={className} style={{ objectFit: "contain" }} />;
  }
  return <DefaultCustomizeIcon className={className} />;
};

// ─── Title Case helper ─────────────────────────────────────────
const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .replace(/(?:^|\s|[-/])\S/g, (match) => match.toUpperCase());

// Global Return Policy component
const GlobalReturnPolicy = ({ isAl }: { isAl: boolean }) => {
  const { settings } = useDesign();
  const policy = isAl
    ? (settings["global_return_policy_al"] || "Politika e kthimit do shtohet së shpejti.")
    : (settings["global_return_policy_en"] || "Returns policy will be added soon.");
  return <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{policy}</p>;
};

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
const ProductGallery = ({ mainImage, productId, selectedColorId, colorImageUrl, onOpenLightbox }: { mainImage?: string | null; productId: string; selectedColorId?: string | null; colorImageUrl?: string | null; onOpenLightbox: (images: string[], index: number) => void }) => {
  const { data: extraImages } = useProductImages(productId);

  // Nëse ngjyra ka image_url direkt (product_colors.image_url), përdore atë.
  // Fallback: merr imazhin e parë nga product_images ku color_id përputhet.
  const colorFeaturedImage = useMemo(() => {
    if (!selectedColorId) return null;
    if (colorImageUrl) return colorImageUrl;
    const first = extraImages?.find((img) => (img as any).color_id === selectedColorId && img.image_url);
    return first?.image_url ?? null;
  }, [selectedColorId, colorImageUrl, extraImages]);

  // Ndërto listën: imazhi i ngjyrës i pari, pastaj mainImage, pastaj të tjerat e kësaj ngjyre
  const allImages = useMemo(() => {
    const imgs: string[] = [];
    if (colorFeaturedImage) imgs.push(colorFeaturedImage);
    if (mainImage && !imgs.includes(mainImage)) imgs.push(mainImage);
    extraImages?.forEach((img) => {
      if (!img.image_url || imgs.includes(img.image_url)) return;
      if (selectedColorId) {
        const imgColorId = (img as any).color_id;
        if (imgColorId && imgColorId !== selectedColorId) return;
      }
      imgs.push(img.image_url);
    });
    return imgs;
  }, [mainImage, extraImages, selectedColorId, colorFeaturedImage]);

  const [selected, setSelected] = useState(0);

  // Kur ndryshon ngjyra → kalo te index 0 (imazhi featured i ngjyrës)
  useEffect(() => { setSelected(0); }, [selectedColorId]);

  const displayImage = allImages[selected] ?? allImages[0];

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
        <img
          key={displayImage}
          src={displayImage}
          alt=""
          className="w-full h-full object-cover transition-opacity duration-300"
        />
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
              key={img}
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
const RelatedProducts = ({ collectionId, currentProductId, isAl, collectionSlug, allColors }: {
  collectionId: string; currentProductId: string; isAl: boolean; collectionSlug: string; allColors?: ProductColor[];
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
          {related.map((p) => {
            var productColors = allColors ? allColors.filter(function (c) { return c.product_id === p.id; }) : [];
            return (
              <div key={p.id} className="group">
                <Link to={`/koleksionet/${collectionSlug}/${p.slug || p.id}`}>
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
                    {toTitleCase(isAl ? p.title_al : p.title_en)}
                  </p>
                </Link>
                {productColors.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2">
                      {productColors.slice(0, 6).map(function (color) {
                        return (
                          <Link
                            key={color.id}
                            to={`/koleksionet/${collectionSlug}/${p.slug || p.id}`}
                            className="w-7 h-7 rounded-full transition-transform hover:scale-110 border border-gray-300 shadow-sm"
                            style={{ backgroundColor: color.color_hex || "#ccc" }}
                            title={isAl ? (color.color_name_al || color.color_name) : (color.color_name_en || color.color_name)}
                          />
                        );
                      })}
                      {productColors.length > 6 && (
                        <Link to={`/koleksionet/${collectionSlug}/${p.slug || p.id}`} className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-[9px] text-muted-foreground">
                          +{productColors.length - 6}
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ─── Main Product Detail Page ───────────────────────────────────
const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

const ProductDetail = () => {
  const { slug, productSlug } = useParams();
  const { isAl } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: collections, isLoading: collectionsLoading } = useCollections();
  const { data: allProducts, isLoading: productsLoading, error: productsError } = useProducts();
  const { data: allColors, isLoading: colorsLoading, error: colorsError } = useAllProductColors();
  const { data: allSizes, isLoading: sizesLoading, error: sizesError } = useAllProductSizes();
  const { data: wishlistItems } = useWishlist(user?.id);
  const toggleWishlist = useToggleWishlist();
  const { addItem } = useCart();
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [redirected, setRedirected] = useState(false);

  const t = (al: string, en: string) => (isAl ? al : en);

  // Find product by slug first, then by UUID for backward compatibility
  const product = useMemo(() => {
    if (!allProducts || !productSlug) return undefined;
    // Try slug match first
    const bySlug = allProducts.find((p) => p.slug === productSlug);
    if (bySlug) return bySlug;
    // Fallback: try UUID match (old URLs)
    if (isUUID(productSlug)) {
      return allProducts.find((p) => p.id === productSlug);
    }
    return undefined;
  }, [allProducts, productSlug]);

  // Redirect old UUID URLs to new slug URLs
  useEffect(() => {
    if (!product || !slug || redirected) return;
    if (productSlug && isUUID(productSlug) && product.slug) {
      setRedirected(true);
      navigate(`/koleksionet/${slug}/${product.slug}`, { replace: true });
    }
  }, [product, productSlug, slug, navigate, redirected]);

  const collection = collections?.find((c) => c.slug === slug);
  const parentCollection = collection?.parent_id
    ? collections?.find((c) => c.id === collection.parent_id)
    : null;

  const productColors = allColors?.filter((c) => c.product_id === product?.id) ?? [];
  const productSizes = allSizes?.filter((s) => s.product_id === product?.id) ?? [];

  const isWishlisted = wishlistItems?.some((w) => w.product_id === product?.id) ?? false;

  const handleWishlistClick = useCallback(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!product?.id) return;
    toggleWishlist.mutate({ userId: user.id, productId: product.id, isWishlisted });
  }, [user, product?.id, isWishlisted, navigate, toggleWishlist]);

  // Show loading spinner while essential data is being fetched
  // Don't block on colors/sizes — they are optional
  if (productsLoading || collectionsLoading || (colorsLoading && !colorsError) || (sizesLoading && !sizesError)) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <SiteFooter />
      </div>
    );
  }

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
              {toTitleCase(isAl ? product.title_al : product.title_en)}
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
            selectedColorId={selectedColorId}
            colorImageUrl={
              selectedColorId
                ? (productColors.find((c) => c.id === selectedColorId) as any)?.image_url || null
                : null
            }
            onOpenLightbox={(images, index) => setLightbox({ images, index })}
          />

          {/* Right: Info */}
          <div className="space-y-6">
            {/* Title & Code */}
            <div>
              <h1 className="text-xl md:text-2xl font-light text-foreground leading-tight" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                {toTitleCase(isAl ? product.title_al : product.title_en)}
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

            {/* Colors — brand palette picker */}
            {productColors.length > 0 && (
              <ProductColorPicker
                productColors={productColors}
                selectedColorId={selectedColorId}
                onSelectColor={setSelectedColorId}
              />
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
                  <CustomizeIcon className="h-3.5 w-3.5" />
                  {t("I PERSONALIZUESHËM", "CUSTOMIZABLE")}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                className="w-full gap-2 rounded-sm h-12 text-sm tracking-wider"
                disabled={!product.in_stock}
                onClick={() => {
                  const selectedColor = productColors.find((c) => c.id === selectedColorId);
                  const selectedSize = productSizes.find((s) => s.id === selectedSizeId);
                  addItem({
                    productId: product.id,
                    title: isAl ? product.title_al : product.title_en,
                    image: product.image_url || "",
                    description: isAl ? product.description_al : product.description_en,
                    color: selectedColor ? (isAl ? (selectedColor.color_name_al || selectedColor.color_name) : (selectedColor.color_name_en || selectedColor.color_name)) : "",
                    colorHex: selectedColor?.color_hex || "",
                    size: selectedSize?.size_label || "",
                    pieces: product.pieces_per_box ?? 1,
                    boxes: 1,
                  });
                  navigate("/shporta");
                }}
              >
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
                  ? t("HIQ NGA TË PREFERUARAT", "REMOVE FROM WISHLIST")
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
                  <GlobalReturnPolicy isAl={isAl} />
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
                    {(isAl ? (product as any).outer_fabric_al : (product as any).outer_fabric_en) && (
                      <p><span className="font-medium text-foreground">{t("Copa e jashtme:", "Outer fabric:")}</span> {isAl ? (product as any).outer_fabric_al : (product as any).outer_fabric_en}</p>
                    )}
                    {(isAl ? (product as any).filling_material_al : (product as any).filling_material_en) && (
                      <p><span className="font-medium text-foreground">{t("Materiali i mbushësit:", "Filling material:")}</span> {isAl ? (product as any).filling_material_al : (product as any).filling_material_en}</p>
                    )}
                    {(isAl ? product.dimensions_al : product.dimensions_en) && (
                      <p><span className="font-medium text-foreground">{t("Përmasat:", "Sizes:")}</span> {isAl ? product.dimensions_al : product.dimensions_en}</p>
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
          allColors={allColors ?? undefined}
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
