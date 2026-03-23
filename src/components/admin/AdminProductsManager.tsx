import { useState } from "react";
import { useCollections } from "@/hooks/useCollections";
import {
  useProducts, useUpsertProduct, useDeleteProduct,
  useProductImages, useAddProductImage, useDeleteProductImage,
  useProductColors, useAddProductColor, useDeleteProductColor,
  useProductSizes, useAddProductSize, useDeleteProductSize,
  type ProductColor, type ProductSize,
} from "@/hooks/useCollections";
import { useToast } from "@/hooks/use-toast";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
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
import { Plus, Trash2, Edit, Package, Image as ImageIcon, ExternalLink, X } from "lucide-react";
import { TranslateButton } from "./TranslateButton";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

const emptyProduct: Partial<Product> = {
  title_al: "", title_en: "", description_al: "", description_en: "",
  code: "",
  composition_al: "", composition_en: "", dimensions_al: "", dimensions_en: "",
  weight_gsm: 0, box_quantity: 1, pieces_per_box: 1,
  in_stock: true, customizable: false,
  product_info_al: "", product_info_en: "",
  return_policy_al: "", return_policy_en: "",
  tech_specs_al: "", tech_specs_en: "",
  image_url: "", visible: true, sort_order: 0,
};

// Sub-component for managing product images
const ProductImagesManager = ({ productId }: { productId: string }) => {
  const { data: images, isLoading } = useProductImages(productId);
  const addImage = useAddProductImage();
  const removeImage = useDeleteProductImage();
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    if ((images?.length ?? 0) >= 10) {
      toast({ title: "Limit", description: "Maksimumi 10 foto", variant: "destructive" });
      return;
    }
    const path = `products/${productId}/${Date.now()}-${file.name}`;
    const url = await uploadCmsImage(file, path);
    addImage.mutate({ product_id: productId, image_url: url, sort_order: images?.length ?? 0 });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          Foto shtesë ({images?.length ?? 0}/10)
        </label>
        <label className="cursor-pointer">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-muted rounded text-xs hover:bg-muted/80">
            <ImageIcon className="h-3 w-3" /> Shto foto
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
            if (e.target.files?.[0]) handleUpload(e.target.files[0]);
          }} />
        </label>
      </div>
      {isLoading ? (
        <div className="text-xs text-muted-foreground">Duke ngarkuar...</div>
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {images?.map((img) => (
            <div key={img.id} className="relative group aspect-square rounded overflow-hidden bg-muted">
              <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              <button
                className="absolute top-1 right-1 w-5 h-5 bg-destructive/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage.mutate({ id: img.id, product_id: productId })}
              >
                <X className="h-3 w-3 text-destructive-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Sub-component for managing product colors
const ProductColorsManager = ({ productId }: { productId: string }) => {
  const { data: colors } = useProductColors(productId);
  const addColor = useAddProductColor();
  const removeColor = useDeleteProductColor();
  const [newNameAl, setNewNameAl] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [newHex, setNewHex] = useState("#FFFFFF");

  const handleAdd = () => {
    if (!newNameAl.trim() && !newNameEn.trim()) return;
    const name = newNameAl || newNameEn;
    addColor.mutate({ product_id: productId, color_name: name, color_name_al: newNameAl, color_name_en: newNameEn, color_hex: newHex, sort_order: colors?.length ?? 0 });
    setNewNameAl("");
    setNewNameEn("");
    setNewHex("#FFFFFF");
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-muted-foreground">Ngjyrat e produktit</label>
      <div className="flex flex-wrap gap-2">
        {colors?.map((c) => (
          <div key={c.id} className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded text-xs">
            <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: c.color_hex }} />
            {c.color_name_al || c.color_name} / {c.color_name_en || c.color_name}
            <button onClick={() => removeColor.mutate({ id: c.id, product_id: productId })}>
              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Input type="color" value={newHex} onChange={(e) => setNewHex(e.target.value)} className="w-10 h-8 p-0.5" />
        <Input value={newNameAl} onChange={(e) => setNewNameAl(e.target.value)} placeholder="Emri AL" className="h-8 text-xs flex-1 min-w-[100px]" />
        <Input value={newNameEn} onChange={(e) => setNewNameEn(e.target.value)} placeholder="Name EN" className="h-8 text-xs flex-1 min-w-[100px]" />
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleAdd}>
          <Plus className="h-3 w-3 mr-1" /> Shto
        </Button>
      </div>
    </div>
  );
};

// Sub-component for managing product sizes
const ProductSizesManager = ({ productId }: { productId: string }) => {
  const { data: sizes } = useProductSizes(productId);
  const addSize = useAddProductSize();
  const removeSize = useDeleteProductSize();
  const [newLabel, setNewLabel] = useState("");

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    addSize.mutate({ product_id: productId, size_label: newLabel, sort_order: sizes?.length ?? 0 });
    setNewLabel("");
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-muted-foreground">Përmasat e produktit</label>
      <div className="flex flex-wrap gap-2">
        {sizes?.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded text-xs">
            {s.size_label}
            <button onClick={() => removeSize.mutate({ id: s.id, product_id: productId })}>
              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="p.sh. 50x100, 80x150" className="h-8 text-xs flex-1" />
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleAdd}>
          <Plus className="h-3 w-3 mr-1" /> Shto
        </Button>
      </div>
    </div>
  );
};

export const AdminProductsManager = () => {
  const { data: collections } = useCollections();
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const { data: products, isLoading } = useProducts(selectedCollection || undefined);
  const upsert = useUpsertProduct();
  const remove = useDeleteProduct();
  const { toast } = useToast();
  const { translateField, translating } = useAutoTranslate();
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

  // Find collection slug for preview link
  const getCollectionSlug = (collectionId: string) => {
    return collections?.find(c => c.id === collectionId)?.slug;
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
                  <span className="text-xs text-muted-foreground">{product.dimensions_al}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Badge variant={product.visible ? "default" : "secondary"} className="text-[10px]">
                    {product.visible ? "Aktiv" : "Fshehur"}
                  </Badge>
                  <div className="flex gap-1">
                    {getCollectionSlug(product.collection_id) && (
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => window.open(`/koleksionet/${getCollectionSlug(product.collection_id)}`, '_blank')}
                        title="Shiko në faqe"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
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
            <DialogTitle className="flex items-center justify-between">
              <span>{editItem?.id ? "Ndrysho Produktin" : "Produkt i Ri"}</span>
              {editItem?.id && getCollectionSlug(editItem.collection_id ?? "") && (
                <Button
                  variant="outline" size="sm"
                  onClick={() => window.open(`/koleksionet/${getCollectionSlug(editItem.collection_id ?? "")}`, '_blank')}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Shiko live
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="general">Përgjithshme</TabsTrigger>
                <TabsTrigger value="details">Detaje</TabsTrigger>
                <TabsTrigger value="variants">Variante</TabsTrigger>
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
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Titulli (AL)</label>
                      <TranslateButton direction="al_to_en" loading={translating === "p_title"} onClick={() => translateField("p_title", editItem.title_al ?? "", "al_to_en", (t) => setEditItem((p) => p ? { ...p, title_en: t } : p))} />
                    </div>
                    <Input value={editItem.title_al ?? ""} onChange={(e) => setEditItem({ ...editItem, title_al: e.target.value })} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Title (EN)</label>
                      <TranslateButton direction="en_to_al" loading={translating === "p_title_r"} onClick={() => translateField("p_title_r", editItem.title_en ?? "", "en_to_al", (t) => setEditItem((p) => p ? { ...p, title_al: t } : p))} />
                    </div>
                    <Input value={editItem.title_en ?? ""} onChange={(e) => setEditItem({ ...editItem, title_en: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Përshkrimi (AL)</label>
                      <TranslateButton direction="al_to_en" loading={translating === "p_desc"} onClick={() => translateField("p_desc", editItem.description_al ?? "", "al_to_en", (t) => setEditItem((p) => p ? { ...p, description_en: t } : p))} />
                    </div>
                    <Textarea value={editItem.description_al ?? ""} onChange={(e) => setEditItem({ ...editItem, description_al: e.target.value })} rows={3} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Description (EN)</label>
                      <TranslateButton direction="en_to_al" loading={translating === "p_desc_r"} onClick={() => translateField("p_desc_r", editItem.description_en ?? "", "en_to_al", (t) => setEditItem((p) => p ? { ...p, description_al: t } : p))} />
                    </div>
                    <Textarea value={editItem.description_en ?? ""} onChange={(e) => setEditItem({ ...editItem, description_en: e.target.value })} rows={3} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Kodi</label>
                  <Input value={editItem.code ?? ""} onChange={(e) => setEditItem({ ...editItem, code: e.target.value })} />
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
                {/* Product Info Accordion */}
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="product-info">
                    <AccordionTrigger className="text-sm">Informacion mbi Produktin</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-muted-foreground">AL</label>
                            <TranslateButton direction="al_to_en" loading={translating === "p_info"} onClick={() => translateField("p_info", editItem.product_info_al ?? "", "al_to_en", (t) => setEditItem((p) => p ? { ...p, product_info_en: t } : p))} />
                          </div>
                          <Textarea value={editItem.product_info_al ?? ""} onChange={(e) => setEditItem({ ...editItem, product_info_al: e.target.value })} rows={4} />
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-muted-foreground">EN</label>
                            <TranslateButton direction="en_to_al" loading={translating === "p_info_r"} onClick={() => translateField("p_info_r", editItem.product_info_en ?? "", "en_to_al", (t) => setEditItem((p) => p ? { ...p, product_info_al: t } : p))} />
                          </div>
                          <Textarea value={editItem.product_info_en ?? ""} onChange={(e) => setEditItem({ ...editItem, product_info_en: e.target.value })} rows={4} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">KUTI (Box Quantity)</label>
                    <Input type="number" min={0} value={editItem.box_quantity ?? 1} onChange={(e) => setEditItem({ ...editItem, box_quantity: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">COPË PËR KUTI (Pieces per Box)</label>
                    <Input type="number" min={0} value={editItem.pieces_per_box ?? 1} onChange={(e) => setEditItem({ ...editItem, pieces_per_box: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Pesha (GSM)</label>
                    <Input type="number" min={0} value={editItem.weight_gsm ?? 0} onChange={(e) => setEditItem({ ...editItem, weight_gsm: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Përbërja (AL)</label>
                      <TranslateButton direction="al_to_en" loading={translating === "p_comp"} onClick={() => translateField("p_comp", editItem.composition_al ?? "", "al_to_en", (t) => setEditItem((p) => p ? { ...p, composition_en: t } : p))} />
                    </div>
                    <Input value={editItem.composition_al ?? ""} onChange={(e) => setEditItem({ ...editItem, composition_al: e.target.value })} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Composition (EN)</label>
                      <TranslateButton direction="en_to_al" loading={translating === "p_comp_r"} onClick={() => translateField("p_comp_r", editItem.composition_en ?? "", "en_to_al", (t) => setEditItem((p) => p ? { ...p, composition_al: t } : p))} />
                    </div>
                    <Input value={editItem.composition_en ?? ""} onChange={(e) => setEditItem({ ...editItem, composition_en: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Dimensionet (AL)</label>
                      <TranslateButton direction="al_to_en" loading={translating === "p_dim"} onClick={() => translateField("p_dim", editItem.dimensions_al ?? "", "al_to_en", (t) => setEditItem((p) => p ? { ...p, dimensions_en: t } : p))} />
                    </div>
                    <Input value={editItem.dimensions_al ?? ""} onChange={(e) => setEditItem({ ...editItem, dimensions_al: e.target.value })} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Dimensions (EN)</label>
                      <TranslateButton direction="en_to_al" loading={translating === "p_dim_r"} onClick={() => translateField("p_dim_r", editItem.dimensions_en ?? "", "en_to_al", (t) => setEditItem((p) => p ? { ...p, dimensions_al: t } : p))} />
                    </div>
                    <Input value={editItem.dimensions_en ?? ""} onChange={(e) => setEditItem({ ...editItem, dimensions_en: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Tech Specs (AL)</label>
                      <TranslateButton direction="al_to_en" loading={translating === "p_specs"} onClick={() => translateField("p_specs", editItem.tech_specs_al ?? "", "al_to_en", (t) => setEditItem((p) => p ? { ...p, tech_specs_en: t } : p))} />
                    </div>
                    <Textarea value={editItem.tech_specs_al ?? ""} onChange={(e) => setEditItem({ ...editItem, tech_specs_al: e.target.value })} rows={3} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Tech Specs (EN)</label>
                      <TranslateButton direction="en_to_al" loading={translating === "p_specs_r"} onClick={() => translateField("p_specs_r", editItem.tech_specs_en ?? "", "en_to_al", (t) => setEditItem((p) => p ? { ...p, tech_specs_al: t } : p))} />
                    </div>
                    <Textarea value={editItem.tech_specs_en ?? ""} onChange={(e) => setEditItem({ ...editItem, tech_specs_en: e.target.value })} rows={3} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="variants" className="space-y-6 mt-4">
                {editItem.id ? (
                  <>
                    <ProductColorsManager productId={editItem.id} />
                    <div className="border-t border-border pt-4" />
                    <ProductSizesManager productId={editItem.id} />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Ruaj produktin fillimisht për të menaxhuar variantet.</p>
                )}
              </TabsContent>

              <TabsContent value="media" className="space-y-6 mt-4">
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

                {/* Additional images - only after product is saved */}
                {editItem.id ? (
                  <ProductImagesManager productId={editItem.id} />
                ) : (
                  <p className="text-xs text-muted-foreground">Ruaj produktin fillimisht për të shtuar foto shtesë.</p>
                )}
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
