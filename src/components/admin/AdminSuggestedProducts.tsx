import { useState } from "react";
import { useProducts } from "@/hooks/useCollections";
import { useHomepageSuggestions, useSetSuggestedProducts } from "@/hooks/useHomepageSuggestions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, X, GripVertical, Save } from "lucide-react";

export const AdminSuggestedProducts = () => {
  const { data: allProducts } = useProducts();
  const { data: suggestions, isLoading } = useHomepageSuggestions();
  const setSuggestions = useSetSuggestedProducts();
  const { toast } = useToast();

  const [selected, setSelected] = useState<string[] | null>(null);

  const currentIds = selected ?? (suggestions?.map((s) => s.product_id) ?? []);

  const toggleProduct = (id: string) => {
    const ids = [...currentIds];
    const idx = ids.indexOf(id);
    if (idx >= 0) ids.splice(idx, 1);
    else if (ids.length < 12) ids.push(id);
    else {
      toast({ title: "Limit", description: "Maksimumi 12 produkte", variant: "destructive" });
      return;
    }
    setSelected(ids);
  };

  const handleSave = () => {
    setSuggestions.mutate(currentIds, {
      onSuccess: () => {
        toast({ title: "U ruajt!" });
        setSelected(null);
      },
      onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
    });
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const ids = [...currentIds];
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    setSelected(ids);
  };

  const moveDown = (idx: number) => {
    if (idx >= currentIds.length - 1) return;
    const ids = [...currentIds];
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    setSelected(ids);
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">Duke ngarkuar...</div>;

  const selectedProducts = currentIds
    .map((id) => allProducts?.find((p) => p.id === id))
    .filter(Boolean) as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Produktet e Sugjeruara</h2>
          <p className="text-sm text-muted-foreground mt-1">Zgjidhni produktet që shfaqen në seksionin "Suggestions" në homepage ({currentIds.length}/12)</p>
        </div>
        <Button onClick={handleSave} disabled={setSuggestions.isPending || selected === null}>
          <Save className="h-4 w-4 mr-1" /> Ruaj
        </Button>
      </div>

      {/* Selected products with reorder */}
      {selectedProducts.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Renditja aktuale</label>
          <div className="space-y-1">
            {selectedProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 bg-muted/50 rounded-lg p-2">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveUp(i)} className="text-muted-foreground hover:text-foreground text-xs">▲</button>
                  <button onClick={() => moveDown(i)} className="text-muted-foreground hover:text-foreground text-xs">▼</button>
                </div>
                {p.image_url && <img src={p.image_url} className="w-10 h-10 rounded object-cover" />}
                <span className="text-sm flex-1">{p.title_al || p.code}</span>
                <Badge variant="secondary" className="text-[10px]">{i + 1}</Badge>
                <button onClick={() => toggleProduct(p.id)}>
                  <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All products grid for selection */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Të gjitha produktet</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-2">
          {allProducts?.map((p) => {
            const isSelected = currentIds.includes(p.id);
            return (
              <Card
                key={p.id}
                className={`cursor-pointer transition-all overflow-hidden ${isSelected ? "ring-2 ring-primary" : "hover:shadow-md"}`}
                onClick={() => toggleProduct(p.id)}
              >
                <div className="relative aspect-square bg-muted">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full"><Package className="h-8 w-8 text-muted-foreground/30" /></div>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Badge className="text-xs">✓ Zgjedhur</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-2">
                  <p className="text-xs truncate">{p.title_al || p.code || "Pa titull"}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
