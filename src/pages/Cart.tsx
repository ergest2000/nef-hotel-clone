import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { useDesign } from "@/hooks/useDesignSettings";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const Cart = () => {
  const { items, removeItem, updateItem, clearCart } = useCart();
  const { isAl } = useLanguage();
  const { settings } = useDesign();

  const t = (key: string, fallbackAl: string, fallbackEn: string) => {
    const alKey = `${key}_al`;
    const enKey = `${key}_en`;
    return isAl ? (settings[alKey] || fallbackAl) : (settings[enKey] || fallbackEn);
  };

  const cartTitle = t("cart_title", "SHPORTË IME", "MY CART");
  const cartEmpty = t("cart_empty", "Shporta juaj është bosh", "Your cart is empty");
  const cartContinue = t("cart_continue", "VAZHDIMËSI", "CONTINUE SHOPPING");
  const cartQuote = t("cart_quote", "KËRKO NJË OFERTË", "REQUEST A QUOTE");
  const tr = (key: string, al: string, en: string) => {
    const alKey = `${key}_al`;
    const enKey = `${key}_en`;
    return isAl ? (settings[alKey] || al) : (settings[enKey] || en);
  };

  const quoteButtonColor = settings["cart_quote_color"] || "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
            <Link to="/" className="hover:text-foreground">{tr("cart_home", "KRYESORE", "HOME")}</Link>
            <span>-</span>
            <span className="text-foreground">{cartTitle}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex-1 w-full">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide-brand text-foreground mb-8">
          {cartTitle}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground mb-4">{cartEmpty}</p>
            <Link to="/koleksionet" className="text-primary hover:underline text-sm">
              {tr("cart_browse", "Shiko produktet", "Browse products")}
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase w-8"></th>
                    <th className="text-left pb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">{tr("cart_product", "PRODUKT", "PRODUCT")}</th>
                    <th className="text-left pb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">{tr("cart_description", "PËRSHKRIMI", "DESCRIPTION")}</th>
                    <th className="text-center pb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">{tr("cart_color", "NGJYRA", "COLOR")}</th>
                    <th className="text-center pb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">{tr("cart_size", "MADHËSIA", "SIZE")}</th>
                    <th className="text-center pb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">{tr("cart_pieces", "COPËZA", "PIECES")}</th>
                    <th className="text-center pb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">{tr("cart_box", "KUTI", "BOX")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.productId + item.color + item.size} className="border-b border-border">
                      <td className="py-6">
                        <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                      <td className="py-6">
                        <div className="w-32 h-24 bg-muted overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="h-8 w-8 text-muted-foreground/20" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-6">
                        <p className="font-medium text-foreground text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                      </td>
                      <td className="py-6 text-center">
                        {item.colorHex && (
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: item.colorHex }} />
                            <span className="text-xs text-muted-foreground">{item.color}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-6 text-center text-sm text-foreground">{item.size || "—"}</td>
                      <td className="py-6 text-center text-sm text-foreground">{item.pieces}</td>
                      <td className="py-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateItem(item.productId, { boxes: Math.max(1, item.boxes - 1) })}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.boxes}</span>
                          <button
                            onClick={() => updateItem(item.productId, { boxes: item.boxes + 1 })}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {items.map((item) => (
                <div key={item.productId + item.color + item.size} className="border border-border p-4 flex gap-4">
                  <div className="w-24 h-24 bg-muted overflow-hidden flex-shrink-0">
                    {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="font-medium text-sm text-foreground truncate">{item.title}</p>
                      <button onClick={() => removeItem(item.productId)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.color} • {item.size || "—"}</p>
                    <p className="text-xs text-muted-foreground">{tr("cart_pieces_label", "Copëza", "Pieces")}: {item.pieces}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">{tr("cart_box_label", "Kuti", "Box")}:</span>
                      <button onClick={() => updateItem(item.productId, { boxes: Math.max(1, item.boxes - 1) })} className="text-muted-foreground"><Minus className="h-3 w-3" /></button>
                      <span className="text-sm font-medium">{item.boxes}</span>
                      <button onClick={() => updateItem(item.productId, { boxes: item.boxes + 1 })} className="text-muted-foreground"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary bar */}
            <div className="bg-muted/50 h-12 mt-6" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
              <Link to="/koleksionet">
                <Button variant="outline" className="w-full sm:w-auto h-14 px-12 text-xs tracking-wider uppercase rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background">
                  {cartContinue}
                </Button>
              </Link>
              <Link to="/checkout">
                <Button
                  className="w-full sm:w-auto h-14 px-12 text-xs tracking-wider uppercase rounded-none text-background"
                  style={quoteButtonColor ? { backgroundColor: `hsl(${quoteButtonColor})` } : { backgroundColor: 'hsl(var(--foreground) / 0.8)' }}
                >
                  {cartQuote}
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>

      <SiteFooter />
    </div>
  );
};

export default Cart;
