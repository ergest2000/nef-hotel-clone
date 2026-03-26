import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useCollections, useProducts, useWishlist, useToggleWishlist } from "@/hooks/useCollections";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Heart } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Collection = Tables<"collections">;
type Product = Tables<"products">;

/* ── Product Card ──────────────────────────────────────────────── */
const ProductCard = ({ product, collectionSlug, isAl }: { product: Product; collectionSlug: string; isAl: boolean }) => {
  const { user } = useAuth();
  const { data: wishlist } = useWishlist(user?.id);
  const toggleWishlist = useToggleWishlist();
  const isWishlisted = wishlist?.some((w) => w.product_id === product.id) ?? false;

  const title = isAl
    ? (product.title_al || product.title_en)
    : (product.title_en || product.title_al);

  const image = product.image_url || "";

  return (
    <div className="group relative flex flex-col">
      <Link
        to={`/koleksionet/${collectionSlug}/${product.id}`}
        className="block"
      >
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              {isAl ? "Pa imazh" : "No image"}
            </div>
          )}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] tracking-brand uppercase px-2 py-1">
              {product.badge}
            </span>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="text-xs md:text-sm tracking-wide-brand text-foreground font-medium group-hover:text-primary transition-colors line-clamp-2">
            {title?.toUpperCase()}
          </h3>
          {product.price != null && (
            <p className="text-sm text-muted-foreground">
              €{Number(product.price).toFixed(2)}
            </p>
          )}
        </div>
      </Link>

      {/* Wishlist button */}
      {user && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist.mutate({
              userId: user.id,
              productId: product.id,
              isWishlisted,
            });
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={16}
            className={isWishlisted ? "fill-red-500 text-red-500" : "text-foreground/60"}
          />
        </button>
      )}
    </div>
  );
};

/* ── Sidebar Nav ───────────────────────────────────────────────── */
const CollectionSidebar = ({
  collections,
  activeSlug,
  isAl,
}: {
  collections: Collection[];
  activeSlug: string | undefined;
  isAl: boolean;
}) => {
  const navigate = useNavigate();

  const parents = collections.filter((c) => !c.parent_id && c.visible !== false);
  const children = collections.filter((c) => c.parent_id && c.visible !== false);

  return (
    <nav className="space-y-1">
      <button
        onClick={() => navigate("/koleksionet")}
        className={`block w-full text-left px-3 py-2 text-xs tracking-brand uppercase transition-colors rounded ${
          !activeSlug
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
      >
        {isAl ? "Të gjitha" : "All"}
      </button>

      {parents.map((col) => {
        const colChildren = children.filter((c) => c.parent_id === col.id);
        const isActive = activeSlug === col.slug;
        const title = isAl
          ? (col.title_al || col.title_en)
          : (col.title_en || col.title_al);

        return (
          <div key={col.id}>
            <button
              onClick={() => navigate(`/koleksionet/${col.slug}`)}
              className={`block w-full text-left px-3 py-2 text-xs tracking-brand uppercase transition-colors rounded ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {title}
            </button>

            {colChildren.length > 0 && (
              <div className="ml-4 space-y-0.5">
                {colChildren.map((child) => {
                  const childTitle = isAl
                    ? (child.title_al || child.title_en)
                    : (child.title_en || child.title_al);
                  const childActive = activeSlug === child.slug;
                  return (
                    <button
                      key={child.id}
                      onClick={() => navigate(`/koleksionet/${child.slug}`)}
                      className={`block w-full text-left px-3 py-1.5 text-[11px] tracking-brand uppercase transition-colors rounded ${
                        childActive
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
    </nav>
  );
};

/* ── Main Collections Page ─────────────────────────────────────── */
const Collections = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAl } = useLanguage();
  const { data: collections, isLoading: loadingCols } = useCollections();
  const { data: allProducts, isLoading: loadingProducts } = useProducts();

  // Find active collection
  const activeCollection = useMemo(
    () => collections?.find((c) => c.slug === slug),
    [collections, slug]
  );

  // Filter products by collection
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    if (!activeCollection) return allProducts;

    // Include products from this collection and any children
    const childIds = collections
      ?.filter((c) => c.parent_id === activeCollection.id)
      .map((c) => c.id) ?? [];

    const relevantIds = [activeCollection.id, ...childIds];
    return allProducts.filter((p) => relevantIds.includes(p.collection_id));
  }, [allProducts, activeCollection, collections]);

  // Determine the collection slug for each product (for URL building)
  const getCollectionSlug = (product: Product) => {
    const col = collections?.find((c) => c.id === product.collection_id);
    return col?.slug || slug || "all";
  };

  // Page title
  const pageTitle = activeCollection
    ? isAl
      ? (activeCollection.title_al || activeCollection.title_en)
      : (activeCollection.title_en || activeCollection.title_al)
    : isAl
    ? "Koleksionet"
    : "Collections";

  const pageDescription = activeCollection
    ? isAl
      ? (activeCollection.description_al || activeCollection.description_en)
      : (activeCollection.description_en || activeCollection.description_al)
    : "";

  const isLoading = loadingCols || loadingProducts;

  return (
    <div className="min-h-screen bg-background md:overflow-visible md:h-auto overflow-y-auto overflow-x-hidden h-screen overscroll-none flex flex-col">
      <SiteHeader />

      {/* Hero banner */}
      <section className="bg-secondary py-12 md:py-20">
        <div className="container text-center">
          <h1 className="text-2xl md:text-4xl tracking-wide-brand font-light text-foreground">
            {pageTitle?.toUpperCase()}
          </h1>
          {pageDescription && (
            <p className="mt-4 text-sm text-muted-foreground max-w-lg mx-auto">
              {pageDescription}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-10 md:py-16 flex-1">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Sidebar */}
            {collections && collections.length > 0 && (
              <aside className="md:w-56 shrink-0">
                {/* Mobile: horizontal scroll pills */}
                <div className="md:hidden flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                  <Link
                    to="/koleksionet"
                    className={`shrink-0 px-4 py-2 rounded-full text-[11px] tracking-brand uppercase border transition-colors ${
                      !slug
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {isAl ? "Të gjitha" : "All"}
                  </Link>
                  {collections
                    .filter((c) => c.visible !== false)
                    .map((col) => {
                      const title = isAl
                        ? (col.title_al || col.title_en)
                        : (col.title_en || col.title_al);
                      return (
                        <Link
                          key={col.id}
                          to={`/koleksionet/${col.slug}`}
                          className={`shrink-0 px-4 py-2 rounded-full text-[11px] tracking-brand uppercase border transition-colors ${
                            slug === col.slug
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          {title}
                        </Link>
                      );
                    })}
                </div>

                {/* Desktop: sidebar nav */}
                <div className="hidden md:block sticky top-28">
                  <CollectionSidebar
                    collections={collections}
                    activeSlug={slug}
                    isAl={isAl}
                  />
                </div>
              </aside>
            )}

            {/* Product grid */}
            <div className="flex-1">
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
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground mb-6">
                    {filteredProducts.length}{" "}
                    {isAl
                      ? filteredProducts.length === 1 ? "produkt" : "produkte"
                      : filteredProducts.length === 1 ? "product" : "products"}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        collectionSlug={getCollectionSlug(product)}
                        isAl={isAl}
                      />
                    ))}
                  </div>
                </>
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
