import { useState } from "react";
import { useCollections } from "@/hooks/useCollections";
import { useProducts, useUpsertProduct, useDeleteProduct } from "@/hooks/useCollections";
import { useToast } from "@/hooks/use-toast";
import { uploadCmsImage } from "@/hooks/useCms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, Edit, Package, Image as ImageIcon, GripVertical } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

const emptyProduct: Partial<Product> = {
  title_al: "", title_en: "", description_al: "", description_en: "",
  code: "", color: "", color_hex: "#FFFFFF",
  composition_al: "", composition_en: "", dimensions_al: "", dimensions_en: "",
  weight_gsm: 0, box_quantity: 1, pieces_per_box: 1,
  in_stock: true, customizable: false,
  product_info_al: "", product_info_en: "",
  return_policy_al: "", return_policy_en: "",
  tech_specs_al: "", tech_specs_en: "",
  image_url: "", visible: true, sort_order: 0,
};

export const AdminProductsManager = () => {
  const { data: collections } = useCollections();
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const { data: products, isLoading } = useProducts(selectedCollection || undefined);
  const upsert = useUpsertProduct();
  const remove = useDeleteProduct();
  const { toast } = useToast();

  const [editItem, setEditItem] = useState<Partial<Product> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSave = () => {
    if (!editItem?.collection_id) {
      toast({ title: "Gabim", description: "Zgjidh koleksionin", variant: "destructive" });
      return;
    }
    upsert.mutate(editItem as any, {
      onSuccess: () => {
        toast({ title: "U ruajt!" });
        setDialogOpen(false);
        setEditItem(null);
      },
      onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Jeni i sigurt?")) return;
    remove.mutate(id, {
      onSuccess: () => toast({ title: "U fshi!" }),
    });
  };

  const handleImageUpload = async (file: File) => {
    const path = `products/${Date.now()}-${file.name}`;
    const url = await uploadCmsImage(file, path);
    setEditItem((prev) => prev ? { ...prev, image_url: url } : prev);
  };

  const openNew = () => {
    setEditItem({
      ...emptyProduct,
      collection_id: selectedCollection || (collections?.[0]?.id ?? ""),
      sort_order: products?.length ?? 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (item: Product) => {
    setEditItem({ ...item });
    setDialogOpen(true);
  };

  const filteredProducts = selectedCollection
    ? products?.filter((p) => p.collection_id === selectedCollection)
    : products;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Produktet</h2>
        <Button onClick={openNew} size="sm" disabled={!collections?.length}>
          <Plus className="h-4 w-4 mr-1" /> Shto Produkt
        </Button>
      </div>

      {/* Filter by collection */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-muted-foreground">Koleksioni:</label>
        <Select value={selectedCollection} onValueChange={setSelectedCollection}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Të gjitha" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjitha</SelectItem>
            {collections?.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.title_al || c.slug}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !filteredProducts?.length ? (
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nuk ka produkte.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative aspect-square bg-muted">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title_al} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {!product.in_stock && <Badge variant="destructive" className="text-[10px]">Jo në stok</Badge>}
                  {product.customizable && <Badge className="text-[10px] bg-primary">Personalizuar</Badge>}
                </div>
              </div>
              <CardContent className="p-3">
                <h4 className="font-medium text-sm truncate">{product.title_al || product.code || "Pa titull"}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{product.code}</p>
                <div className="flex items-center gap-2 mt-2">
                  {product.color_hex && (
                    <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: product.color_hex }} />
                  )}
                  <span className="text-xs text-muted-foreground">{product.dimensions_al}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Badge variant={product.visible ? "default" : "secondary"} className="text-[10px]">
                    {product.visible ? "Aktiv" : "Fshehur"}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(product)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem?.id ? "Ndrysho Produktin" : "Produkt i Ri"}</DialogTitle>
          </DialogHeader>
          {editItem && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="general">Të përgjithshme</TabsTrigger>
                <TabsTrigger value="details">Detaje</TabsTrigger>
                <TabsTrigger value="info">Info / Specs</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Koleksioni</label>
                  <Select
                    value={editItem.collection_id ?? ""}
                    onValueChange={(v) => setEditItem({ ...editItem, collection_id: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {collections?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.title_al || c.slug}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Titulli (AL)</label>
                    <Input value={editItem.title_al ?? ""} onChange={(e) => setEditItem({ ...editItem, title_al: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Title (EN)</label>
                    <Input value={editItem.title_en ?? ""} onChange={(e) => setEditItem({ ...editItem, title_en: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Përshkrimi (AL)</label>
                    <Textarea value={editItem.description_al ?? ""} onChange={(e) => setEditItem({ ...editItem, description_al: e.target.value })} rows={3} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Description (EN)</label>
                    <Textarea value={editItem.description_en ?? ""} onChange={(e) => setEditItem({ ...editItem, description_en: e.target.value })} rows={3} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Kodi</label>
                    <Input value={editItem.code ?? ""} onChange={(e) => setEditItem({ ...editItem, code: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Ngjyra</label>
                    <Input value={editItem.color ?? ""} onChange={(e) => setEditItem({ ...editItem, color: e.target.value })} placeholder="E bardhë" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Ngjyra (Hex)</label>
                    <div className="flex gap-2">
                      <Input type="color" value={editItem.color_hex ?? "#FFFFFF"} onChange={(e) => setEditItem({ ...editItem, color_hex: e.target.value })} className="w-12 p-1 h-10" />
                      <Input value={editItem.color_hex ?? ""} onChange={(e) => setEditItem({ ...editItem, color_hex: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={editItem.in_stock ?? true} onCheckedChange={(v) => setEditItem({ ...editItem, in_stock: v })} />
                    <span className="text-sm">Në stok</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={editItem.customizable ?? false} onCheckedChange={(v) => setEditItem({ ...editItem, customizable: v })} />
                    <span className="text-sm">I personalizueshëm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={editItem.visible ?? true} onCheckedChange={(v) => setEditItem({ ...editItem, visible: v })} />
                    <span className="text-sm">I dukshëm</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Përbërja (AL)</label>
                    <Input value={editItem.composition_al ?? ""} onChange={(e) => setEditItem({ ...editItem, composition_al: e.target.value })} placeholder="100% Pambuk" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Composition (EN)</label>
                    <Input value={editItem.composition_en ?? ""} onChange={(e) => setEditItem({ ...editItem, composition_en: e.target.value })} placeholder="100% Cotton" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Dimensionet (AL)</label>
                    <Input value={editItem.dimensions_al ?? ""} onChange={(e) => setEditItem({ ...editItem, dimensions_al: e.target.value })} placeholder="80x150" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Dimensions (EN)</label>
                    <Input value={editItem.dimensions_en ?? ""} onChange={(e) => setEditItem({ ...editItem, dimensions_en: e.target.value })} placeholder="80x150" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Pesha (GSM)</label>
                    <Input type="number" value={editItem.weight_gsm ?? 0} onChange={(e) => setEditItem({ ...editItem, weight_gsm: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Kuti</label>
                    <Input type="number" value={editItem.box_quantity ?? 1} onChange={(e) => setEditItem({ ...editItem, box_quantity: parseInt(e.target.value) || 1 })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Copë / Kuti</label>
                    <Input type="number" value={editItem.pieces_per_box ?? 1} onChange={(e) => setEditItem({ ...editItem, pieces_per_box: parseInt(e.target.value) || 1 })} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="info" className="space-y-4 mt-4">
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="product-info">
                    <AccordionTrigger className="text-sm">Informacion mbi Produktin</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">AL</label>
                          <Textarea value={editItem.product_info_al ?? ""} onChange={(e) => setEditItem({ ...editItem, product_info_al: e.target.value })} rows={4} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">EN</label>
                          <Textarea value={editItem.product_info_en ?? ""} onChange={(e) => setEditItem({ ...editItem, product_info_en: e.target.value })} rows={4} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="return-policy">
                    <AccordionTrigger className="text-sm">Politika e Kthimit</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">AL</label>
                          <Textarea value={editItem.return_policy_al ?? ""} onChange={(e) => setEditItem({ ...editItem, return_policy_al: e.target.value })} rows={4} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">EN</label>
                          <Textarea value={editItem.return_policy_en ?? ""} onChange={(e) => setEditItem({ ...editItem, return_policy_en: e.target.value })} rows={4} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="tech-specs">
                    <AccordionTrigger className="text-sm">Specifikimet Teknike</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">AL</label>
                          <Textarea value={editItem.tech_specs_al ?? ""} onChange={(e) => setEditItem({ ...editItem, tech_specs_al: e.target.value })} rows={4} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">EN</label>
                          <Textarea value={editItem.tech_specs_en ?? ""} onChange={(e) => setEditItem({ ...editItem, tech_specs_en: e.target.value })} rows={4} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              <TabsContent value="media" className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Imazhi kryesor</label>
                  <div className="flex items-center gap-3 mt-1">
                    {editItem.image_url && (
                      <img src={editItem.image_url} alt="" className="h-24 w-24 object-cover rounded" />
                    )}
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded text-sm hover:bg-muted/80">
                        <ImageIcon className="h-4 w-4" /> Ngarko imazh
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                      }} />
                    </label>
                  </div>
                </div>
              </TabsContent>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Anulo</Button>
                <Button onClick={handleSave} disabled={upsert.isPending}>
                  {upsert.isPending ? "Duke ruajtur..." : "Ruaj"}
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
