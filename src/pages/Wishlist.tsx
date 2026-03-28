import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist, useToggleWishlist } from "@/hooks/useCollections";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Wishlist = () => {
  const { user } = useAuth();
  const { isAl } = useLanguage();
  const navigate = useNavigate();
  const { data: wishlistItems, isLoading } = useWishlist(user?.id);
  const toggleWishlist = useToggleWishlist();

  const productIds = wishlistItems?.map((w) => w.product_id) ?? [];

  const { data: products } = useQuery({
    queryKey: ["wishlist-products", productIds],
    enabled: productIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, collections(slug, title_al, title_en)")
        .in("id", productIds);
      if (error) throw error;
      return data;
    },
  });

  const handleRemove = (productId: string) => {
    if (!user) return;
    toggleWishlist.mutate({ userId: user.id, productId, isWishlisted: true });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col md:overflow-visible md:h-auto overflow-y-auto h-screen overscroll-none">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <Heart size={48} className="mx-auto mb-4 text-muted-foreground/30" />
            <h1 className="text-2xl font-light tracking-brand text-foreground mb-3">
              {isAl ? "LISTA E PREFERUARAVE" : "WISHLIST"}
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              {isAl ? "Duhet të jeni i loguar për të parë listën e preferuarave." : "You need to be logged in to view your wishlist."}
            </p>
            <Button onClick={() => navigate("/login")} className="text-xs tracking-wide-brand uppercase">
              {isAl ? "IDENTIFIKOHU" : "LOG IN"}
            </Button>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:overflow-visible md:h-auto overflow-y-auto h-screen overscroll-none">
      <SiteHeader />

      <section className="py-12 md:py-16">
        <div className="container">
          <h1 className="text-2xl md:text-3xl font-light tracking-brand text-foreground text-center mb-10">
            {isAl ? "LISTA E PREFERUARAVE" : "WISHLIST"}
          </h1>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !wishlistItems || wishlistItems.length === 0 ? (
            <div className="text-center py-20">
              <Heart size={48} className="mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground mb-6">
                {isAl ? "Nuk keni produkte të preferuara ende." : "You have no wishlist items yet."}
              </p>
              <Button variant="outline" onClick={() => navigate("/koleksionet")} className="text-xs tracking-wide-brand uppercase">
                {isAl ? "SHFLETO PRODUKTET" : "BROWSE PRODUCTS"}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products?.map((product) => {
                const collection = product.collections as any;
                const collectionSlug = collection?.slug || "";
                return (
                  <div key={product.id} className="group border border-border bg-background hover:shadow-lg transition-all duration-300">
                    <Link to={`/koleksionet/${collectionSlug}/${(product as any).slug || product.id}`} className="block">
                      <div className="aspect-square bg-muted overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={isAl ? product.title_al : product.title_en}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={40} className="text-muted-foreground/20" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/koleksionet/${collectionSlug}/${(product as any).slug || product.id}`}>
                        <p className="text-xs text-muted-foreground mb-1">
                          {isAl ? collection?.title_al : collection?.title_en || collection?.title_al}
                        </p>
                        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {isAl ? product.title_al : product.title_en || product.title_al}
                        </h3>
                        {product.code && (
                          <p className="text-xs text-muted-foreground mt-1">Code: {product.code}</p>
                        )}
                      </Link>
                      <button
                        onClick={() => handleRemove(product.id)}
                        disabled={toggleWishlist.isPending}
                        className="mt-3 flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <Trash2 size={14} />
                        {isAl ? "Hiq nga lista" : "Remove"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Wishlist;
