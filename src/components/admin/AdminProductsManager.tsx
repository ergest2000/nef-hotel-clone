import { useState, useEffect } from "react";
import { useCollections } from "@/hooks/useCollections";
import {
  useProducts, useUpsertProduct, useDeleteProduct, useUpdateProductOrder,
  useProductImages, useAddProductImage, useDeleteProductImage, useUpdateProductImage,
  useProductColors, useAddProductColor, useDeleteProductColor, useUpdateProductColor,
  useProductSizes, useAddProductSize, useDeleteProductSize,
  useGlobalColors,
  type ProductColor, type ProductSize,
} from "@/hooks/useCollections";
import { useDuplicateProduct } from "@/hooks/useDuplicateProduct";
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
import { Plus, Trash2, Edit, Package, Image as ImageIcon, ExternalLink, X, Copy, Search, FolderOpen, Check, RefreshCw, GripVertical, ArrowUpDown } from "lucide-react";
import { TranslateButton } from "./TranslateButton";
import { ProductCategoriesManager } from "./ProductCategoriesManager";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


// ── Media Picker Modal ─────────────────────────────────────────────
import { MediaPickerModal } from "./MediaPickerModal";

type Product = Tables<"products">;

const emptyProduct: Partial<Product> = {
  title_al: "", title_en: "", description_al: "", description_en: "",
  code: "",
  composition_al: "", composition_en: "",
  outer_fabric_al: "", outer_fabric_en: "",
  filling_material_al: "", filling_material_en: "",
  weight_gsm: 0, box_quantity: 1, pieces_per_box: 1,
  in_stock: true, customizable: false,
  product_info_al: "", product_info_en: "",
  return_policy_al: "", return_policy_en: "",
  image_url: "", visible: true, sort_order: 0,
};

const ProductImagesManager = ({ productId }: { productId: string }) => {
  const { data: images, isLoading } = useProductImages(productId);
  const { data: colors } = useProductColors(productId);
  const addImage = useAddProductImage();
  const removeImage = useDeleteProductImage();
  const updateImage = useUpdateProductImage();
  const { toast } = useToast();
  const [uploadColorId, setUploadColorId] = useState<string>("");

  const [uploading, setUploading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const handleUpload = async (files: FileList) => {
    const current = images?.length ?? 0;
    const remaining = 10 - current;
    if (remaining <= 0) {
      toast({ title: "Limit", description: "Maksimumi 10 foto", variant: "destructive" });
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      const path = `products/${productId}/${Date.now()}-${file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const url = await uploadCmsImage(file, path);
      addImage.mutate({
        product_id: productId,
        image_url: url,
        sort_order: current + i,
        color_id: uploadColorId || null,
      });
    }
    setUploading(false);
    toast({ title: `U ngarkuan ${toUpload.length} foto!` });
  };

  const getColorName = (colorId: string | null) => {
    if (!colorId || !colors) return null;
    const c = colors.find((cl) => cl.id === colorId);
    return c ? (c.color_name_al || c.color_name) : null;
  };

  const getColorHex = (colorId: string | null) => {
    if (!colorId || !colors) return null;
    const c = colors.find((cl) => cl.id === colorId);
    return c?.color_hex ?? null;
  };

  const handlePickFromMedia = (urls: string[]) => {
    const current = images?.length ?? 0;
    urls.slice(0, 10 - current).forEach((url, i) => {
      addImage.mutate({
        product_id: productId,
        image_url: url,
        sort_order: current + i,
        color_id: uploadColorId || null,
      });
    });
    toast({ title: `U shtuan ${Math.min(urls.length, 10 - current)} foto!` });
  };

  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          Foto shtesë ({images?.length ?? 0}/10)
        </label>
        <button
          onClick={() => setShowMediaPicker(true)}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ImageIcon className="h-3 w-3" /> Zgjidh nga Media
        </button>
      </div>

      <MediaPickerModal
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handlePickFromMedia}
      />

      {colors && colors.length > 0 && (
        <select
          value={uploadColorId}
          onChange={(e) => setUploadColorId(e.target.value)}
          className="h-8 text-xs border border-border rounded px-2 bg-background w-full"
        >
          <option value="">Pa ngjyrë (Gjenerale)</option>
          {colors.map((c) => (
            <option key={c.id} value={c.id}>{c.color_name_al || c.color_name}</option>
          ))}
        </select>
      )}

      <label
        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:bg-muted/50"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <ImageIcon className="h-6 w-6" />
          <span className="text-xs font-medium">
            {uploading ? "Duke ngarkuar..." : "Tërhiq foto këtu ose kliko për të zgjedhur"}
          </span>
          <span className="text-[10px]">Mund të zgjedhësh disa foto njëherësh</span>
        </div>
        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) handleUpload(e.target.files);
        }} />
      </label>
      {uploadColorId && (
        <span className="text-[10px] text-muted-foreground">
          → do lidhet me: <strong>{getColorName(uploadColorId)}</strong>
        </span>
      )}

      {isLoading ? (
        <div className="text-xs text-muted-foreground">Duke ngarkuar...</div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {images?.map((img) => (
            <div key={img.id} className="relative group rounded overflow-hidden bg-muted">
              <div className="aspect-square">
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-1 flex items-center gap-1">
                {(img as any).color_id ? (
                  <>
                    <div className="w-3 h-3 rounded-full border border-white/40 shrink-0" style={{ backgroundColor: getColorHex((img as any).color_id) || "#ccc" }} />
                    <span className="text-[9px] text-white truncate">{getColorName((img as any).color_id)}</span>
                  </>
                ) : (
                  <span className="text-[9px] text-white/60">Gjenerale</span>
                )}
              </div>
              {colors && colors.length > 0 && (
                <select
                  value={(img as any).color_id || ""}
                  onChange={(e) => updateImage.mutate({ id: img.id, product_id: productId, updates: { color_id: e.target.value || null } })}
                  className="absolute top-1 left-1 w-[calc(100%-2.25rem)] h-5 text-[9px] bg-white/90 border-0 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <option value="">Gjenerale</option>
                  {colors.map((c) => (
                    <option key={c.id} value={c.id}>{c.color_name_al || c.color_name}</option>
                  ))}
                </select>
              )}
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

const ProductColorsManager = ({ productId }: { productId: string }) => {
  const { data: colors } = useProductColors(productId);
  const { data: globalColors } = useGlobalColors();
  const addColor = useAddProductColor();
  const removeColor = useDeleteProductColor();
  const updateColor = useUpdateProductColor();
  const { toast } = useToast();

  const assignedHexes = new Set(colors?.map((c) => c.color_hex.toLowerCase()) ?? []);
  const availableColors = globalColors?.filter((gc) => !assignedHexes.has(gc.hex.toLowerCase())) ?? [];

  const handleSelectColor = (gc: { name_al: string; name_en: string; hex: string }) => {
    addColor.mutate({
      product_id: productId,
      color_name: gc.name_al || gc.name_en,
      color_name_al: gc.name_al,
      color_name_en: gc.name_en,
      color_hex: gc.hex,
      image_url: "",
      sort_order: colors?.length ?? 0,
    });
  };

  const handleColorImageUpload = async (colorId: string, file: File) => {
    try {
      const path = `products/${productId}/colors/${Date.now()}-${file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const url = await uploadCmsImage(file, path);
      updateColor.mutate({ id: colorId, product_id: productId, updates: { image_url: url } });
      toast({ title: "Imazhi i ngjyrës u ngarkua!" });
    } catch (e: any) {
      toast({ title: "Gabim", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-muted-foreground">Ngjyrat e produktit</label>
      <div className="space-y-2">
        {colors?.map((c) => (
          <div key={c.id} className="flex items-center gap-3 bg-muted px-3 py-2 rounded">
            <div className="w-8 h-8 rounded-full border border-border shrink-0" style={{ backgroundColor: c.color_hex }} />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium">{c.color_name_al || c.color_name}</span>
              <span className="text-xs text-muted-foreground"> / {c.color_name_en || c.color_name}</span>
            </div>
            {(c as any).image_url ? (
              <div className="relative group w-10 h-10 rounded overflow-hidden bg-secondary shrink-0">
                <img src={(c as any).image_url} alt="" className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <ImageIcon className="h-3 w-3 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    if (e.target.files?.[0]) handleColorImageUpload(c.id, e.target.files[0]);
                  }} />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer shrink-0">
                <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded text-[10px] hover:bg-secondary/80 text-muted-foreground">
                  <ImageIcon className="h-3 w-3" /> Foto
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  if (e.target.files?.[0]) handleColorImageUpload(c.id, e.target.files[0]);
                }} />
              </label>
            )}
            <button onClick={() => removeColor.mutate({ id: c.id, product_id: productId })}>
              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        ))}
      </div>
      {availableColors.length > 0 ? (
        <div>
          <p className="text-[10px] text-muted-foreground mb-2">Zgjidh nga ngjyrat e paracaktuara:</p>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((gc) => (
              <button
                key={gc.id}
                onClick={() => handleSelectColor(gc)}
                className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-sm hover:border-primary hover:bg-primary/5 transition-colors"
                title={`${gc.name_al} / ${gc.name_en}`}
              >
                <div className="w-5 h-5 rounded-full border border-border shrink-0" style={{ backgroundColor: gc.hex }} />
                <span className="text-xs text-foreground">{gc.name_al || gc.name_en}</span>
              </button>
            ))}
          </div>
        </div>
      ) : globalColors && globalColors.length === 0 ? (
        <p className="text-[10px] text-muted-foreground">
          Nuk ka ngjyra globale. Shto nga Dashboard → Ngjyrat e Produktit.
        </p>
      ) : null}
    </div>
  );
};

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
        <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="p.sh. 50x100, 80x150" className="h-8 text-xs flex-1"
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
        />
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleAdd}>
          <Plus className="h-3 w-3 mr-1" /> Shto
        </Button>
      </div>
    </div>
  );
};

// ── Sortable Product Row (drag-drop reorder list) ─────────────────────────
const SortableProductRow = ({
  product,
  index,
  onEdit,
}: {
  product: Product;
  index: number;
  onEdit: (product: Product) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-2.5 bg-background border border-border rounded-md hover:bg-muted/30 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none p-1"
        title="Mbaj e zvarrit për të ndryshuar renditjen"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="text-[10px] text-muted-foreground font-mono w-6 text-center shrink-0">
        {index + 1}
      </span>
      <div className="w-12 h-12 bg-muted border border-border rounded overflow-hidden shrink-0">
        {product.image_url ? (
          <img src={product.image_url} alt={product.title_al ?? ""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-5 w-5 text-muted-foreground/30" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {product.title_al || product.code || "Pa titull"}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {product.code && (
            <span className="text-[10px] text-muted-foreground font-mono">{product.code}</span>
          )}
          {!product.visible && (
            <Badge variant="secondary" className="text-[9px] h-4 px-1.5">Fshehur</Badge>
          )}
          {!product.in_stock && (
            <Badge variant="destructive" className="text-[9px] h-4 px-1.5">Jo në stok</Badge>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={() => onEdit(product)}
        title="Ndrysho"
      >
        <Edit className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export const AdminProductsManager = () => {
  const { data: collections } = useCollections();
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const { data: products, isLoading } = useProducts(
    selectedCollection && selectedCollection !== "all" ? selectedCollection : undefined
  );
  const upsert = useUpsertProduct();
  const remove = useDeleteProduct();
  const duplicate = useDuplicateProduct();
  const updateOrder = useUpdateProductOrder();
  const { toast } = useToast();
  const { translateField, translating } = useAutoTranslate();
  const [editItem, setEditItem] = useState<Partial<Product> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPrimaryMediaPicker, setShowPrimaryMediaPicker] = useState(false);

  // ── Renditja Manuale (drag-drop) ─────────────────────────────────────────
  // E aktivizojmë vetëm kur kemi një koleksion të zgjedhur (jo "Të gjitha")
  // dhe kur nuk ka kërkim aktiv — përndryshe renditja nuk ka kuptim.
  const [reorderMode, setReorderMode] = useState(false);
  const [localOrder, setLocalOrder] = useState<Product[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Kur hapet modaliteti, marrim foton fillestare të renditjes
  // (vetëm produktet kryesore të koleksionit aktiv — pa cross-listings)
  useEffect(() => {
    if (reorderMode && products && selectedCollection && selectedCollection !== "all") {
      const primaryOnly = products.filter((p) => p.collection_id === selectedCollection);
      setLocalOrder(primaryOnly);
    } else if (!reorderMode) {
      setLocalOrder([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reorderMode, selectedCollection]);

  // Kur produktet refresh-ohen (p.sh. pas save), update-ojmë localOrder
  // duke respektuar renditjen që ka filluar përdoruesi.
  useEffect(() => {
    if (reorderMode && products && selectedCollection && selectedCollection !== "all") {
      const primaryOnly = products.filter((p) => p.collection_id === selectedCollection);
      // Mbaj renditjen lokale; vetëm shto produkte të reja në fund
      // dhe hiq ato që janë fshirë.
      setLocalOrder((prev) => {
        const prevIds = new Set(prev.map((p) => p.id));
        const currentIds = new Set(primaryOnly.map((p) => p.id));
        // Hiq të fshirat
        const kept = prev.filter((p) => currentIds.has(p.id));
        // Shto të rejat
        const added = primaryOnly.filter((p) => !prevIds.has(p.id));
        return [...kept, ...added];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = localOrder.findIndex((p) => p.id === active.id);
    const newIdx = localOrder.findIndex((p) => p.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const reordered = [...localOrder];
    const [moved] = reordered.splice(oldIdx, 1);
    reordered.splice(newIdx, 0, moved);

    // Update i menjëhershëm vizual (optimistic)
    setLocalOrder(reordered);

    // Ruaj në DB në background
    updateOrder.mutate(
      reordered.map((p, i) => ({ id: p.id, sort_order: i })),
      {
        onError: (e) =>
          toast({
            title: "Renditja nuk u ruajt",
            description: e.message,
            variant: "destructive",
          }),
      }
    );
  };
  // ─────────────────────────────────────────────────────────────────────────

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

  const handleDuplicate = (id: string) => {
    duplicate.mutate(id);
  };

  const handleImageUpload = async (file: File) => {
    const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `products/${Date.now()}-${safeName}`;
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

  const getCollectionSlug = (collectionId: string) => {
    return collections?.find(c => c.id === collectionId)?.slug;
  };

  // Detect if the currently edited product belongs to Jorgan or Jastëk category
  const isJorganOrJastek = (() => {
    const colId = editItem?.collection_id;
    if (!colId || !collections) return false;
    const col = collections.find(c => c.id === colId);
    const text = `${col?.title_al ?? ""} ${col?.title_en ?? ""} ${col?.slug ?? ""}`.toLowerCase();
    return /jorgan|jastek|jast[eë]k|duvet|pillow/.test(text);
  })();

  const filteredProducts = products?.filter((p) => {
    const matchesCollection = !selectedCollection || selectedCollection === "all"
      ? true
      : p.collection_id === selectedCollection;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q
      ? true
      : (p.title_al?.toLowerCase().includes(q) ||
         p.title_en?.toLowerCase().includes(q) ||
         p.code?.toLowerCase().includes(q) ||
         p.slug?.toLowerCase().includes(q));
    return matchesCollection && matchesSearch;
  });

  // A mund ta aktivizojmë renditjen manuale? Vetëm kur:
  //  - është zgjedhur një koleksion specifik (jo "Të gjitha")
  //  - nuk ka kërkim aktiv
  const canReorder =
    !!selectedCollection &&
    selectedCollection !== "all" &&
    !searchTerm.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          {reorderMode ? "Renditja e Produkteve" : "Produktet"}
          {!reorderMode && searchTerm && filteredProducts !== undefined && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredProducts.length} rezultate)
            </span>
          )}
          {reorderMode && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({localOrder.length} produkte)
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {reorderMode ? (
            <Button
              onClick={() => setReorderMode(false)}
              size="sm"
              variant="default"
            >
              <Check className="h-4 w-4 mr-1" /> Mbaroi
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setReorderMode(true)}
                size="sm"
                variant="outline"
                disabled={!canReorder}
                title={
                  canReorder
                    ? "Renditja manuale e produkteve me drag-drop"
                    : "Zgjidh një koleksion specifik dhe pastro kërkimin për të aktivizuar renditjen"
                }
              >
                <ArrowUpDown className="h-4 w-4 mr-1" /> Rendit
              </Button>
              <Button onClick={openNew} size="sm" disabled={!collections?.length}>
                <Plus className="h-4 w-4 mr-1" /> Shto Produkt
              </Button>
            </>
          )}
        </div>
      </div>

      {reorderMode && (
        <div className="border-l-2 border-primary bg-primary/5 px-3 py-2 text-xs text-muted-foreground rounded-r">
          Mbaj ikonën <GripVertical className="inline h-3 w-3 align-middle" /> dhe zvarrit
          produktet për të ndryshuar renditjen. Ndryshimet ruhen automatikisht.
        </div>
      )}

      {!reorderMode && (
      <div className="flex items-center gap-3 flex-wrap">
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
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Kërko sipas titullit, kodit..."
            className="pl-8 h-9 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      )}

      {reorderMode && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Koleksioni:</span>
          <Badge variant="secondary" className="text-xs">
            {collections?.find((c) => c.id === selectedCollection)?.title_al || selectedCollection}
          </Badge>
          {updateOrder.isPending && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3 animate-spin" /> Duke ruajtur...
            </span>
          )}
        </div>
      )}

      {reorderMode ? (
        localOrder.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nuk ka produkte për të renditur.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localOrder.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1.5">
                {localOrder.map((product, idx) => (
                  <SortableProductRow
                    key={product.id}
                    product={product}
                    index={idx}
                    onEdit={openEdit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )
      ) : isLoading ? (
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
                {product.slug && (
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate font-mono">/{product.slug}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <Badge variant={product.visible ? "default" : "secondary"} className="text-[10px]">
                    {product.visible ? "Aktiv" : "Fshehur"}
                  </Badge>
                  <div className="flex gap-1">
                    {getCollectionSlug(product.collection_id) && (
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => window.open(`/koleksionet/${getCollectionSlug(product.collection_id)}/${product.slug || product.id}`, '_blank')}
                        title="Shiko në faqe"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(product)} title="Ndrysho">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => handleDuplicate(product.id)}
                      disabled={duplicate.isPending}
                      title="Duplikо"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(product.id)} title="Fshi">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{editItem?.id ? "Ndrysho Produktin" : "Produkt i Ri"}</span>
              {editItem?.id && getCollectionSlug(editItem.collection_id ?? "") && (
                <Button
                  variant="outline" size="sm"
                  onClick={() => window.open(`/koleksionet/${getCollectionSlug(editItem.collection_id ?? "")}/${editItem.slug || editItem.id}`, '_blank')}
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
                {/* Kategoritë */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Kategoritë</label>
                  {editItem.id ? (
                    <ProductCategoriesManager
                      productId={editItem.id}
                      primaryCollectionId={editItem.collection_id ?? ""}
                      onChangePrimary={(id) => setEditItem({ ...editItem, collection_id: id })}
                    />
                  ) : (
                    <>
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
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Kategori shtesë mund të shtohen pasi të ruhet produkti.
                      </p>
                    </>
                  )}
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
                    <Textarea value={editItem.description_al ?? ""} onChange={(e) => setEditItem({ ...editItem, description_al: e.target.value })} rows={6} placeholder="Shkruaj përshkrimin... Përdor Enter për të krijuar paragrafë të rinj." />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Description (EN)</label>
                      <TranslateButton direction="en_to_al" loading={translating === "p_desc_r"} onClick={() => translateField("p_desc_r", editItem.description_en ?? "", "en_to_al", (t) => setEditItem((p) => p ? { ...p, description_al: t } : p))} />
                    </div>
                    <Textarea value={editItem.description_en ?? ""} onChange={(e) => setEditItem({ ...editItem, description_en: e.target.value })} rows={6} placeholder="Write description... Use Enter to create new paragraphs." />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Kodi</label>
                  <Input value={editItem.code ?? ""} onChange={(e) => setEditItem({ ...editItem, code: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Slug (URL)</label>
                  <Input
                    value={editItem.slug ?? ""}
                    onChange={(e) => setEditItem({ ...editItem, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') })}
                    placeholder="Gjenerohet automatikisht nga titulli"
                    className="font-mono text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Lëre bosh për gjenerim automatik. Ndrysho vetëm nëse ke arsye specifike.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Link i jashtëm (hapet në New Tab)
                  </label>
                  <Input
                    type="url"
                    value={(editItem as any).external_url ?? ""}
                    onChange={(e) => setEditItem({ ...editItem, external_url: e.target.value || null } as any)}
                    placeholder="p.sh. https://groupegm.com/brand/nuxe-ligne-standard/"
                    className="font-mono text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Nëse e plotëson, klikimi mbi produkt në faqen e koleksionit
                    nuk hap faqen e brendshme të produktit por hap drejtpërdrejt
                    këtë link në një tab të ri. Përdore për brande që kërkojnë
                    ridrejtim te faqja e tyre zyrtare (p.sh. Groupe GM). Lëre
                    bosh për sjelljen normale.
                  </p>
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

                {/* Copa e jashtme + Materiali i mbushësit — vetëm Jorgan/Jastëk */}
                {isJorganOrJastek && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-muted-foreground">Copa e jashtme (AL)</label>
                          <TranslateButton direction="al_to_en" loading={translating === "p_outer_al"} onClick={() => translateField("p_outer_al", editItem.outer_fabric_al ?? "", "al_to_en", (t) => setEditItem((p) => p ? { ...p, outer_fabric_en: t } : p))} />
                        </div>
                        <Input value={editItem.outer_fabric_al ?? ""} onChange={(e) => setEditItem({ ...editItem, outer_fabric_al: e.target.value })} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-muted-foreground">Outer fabric (EN)</label>
                          <TranslateButton direction="en_to_al" loading={translating === "p_outer_en"} onClick={() => translateField("p_outer_en", editItem.outer_fabric_en ?? "", "en_to_al", (t) => setEditItem((p) => p ? { ...p, outer_fabric_al: t } : p))} />
                        </div>
                        <Input value={editItem.outer_fabric_en ?? ""} onChange={(e) => setEditItem({ ...editItem, outer_fabric_en: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-muted-foreground">Materiali i mbushësit (AL)</label>
                          <TranslateButton direction="al_to_en" loading={translating === "p_fill_al"} onClick={() => translateField("p_fill_al", editItem.filling_material_al ?? "", "al_to_en", (t) => setEditItem((p) => p ? { ...p, filling_material_en: t } : p))} />
                        </div>
                        <Input value={editItem.filling_material_al ?? ""} onChange={(e) => setEditItem({ ...editItem, filling_material_al: e.target.value })} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-muted-foreground">Filling material (EN)</label>
                          <TranslateButton direction="en_to_al" loading={translating === "p_fill_en"} onClick={() => translateField("p_fill_en", editItem.filling_material_en ?? "", "en_to_al", (t) => setEditItem((p) => p ? { ...p, filling_material_al: t } : p))} />
                        </div>
                        <Input value={editItem.filling_material_en ?? ""} onChange={(e) => setEditItem({ ...editItem, filling_material_en: e.target.value })} />
                      </div>
                    </div>
                  </>
                )}
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
                      <div className="relative group">
                        <img src={editItem.image_url} alt="" className="h-24 w-24 object-cover rounded" />
                        <button
                          onClick={() => setEditItem((p) => p ? { ...p, image_url: "" } : p)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    )}
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded text-sm hover:bg-muted/80">
                        <ImageIcon className="h-4 w-4" /> Ngarko imazh
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                      }} />
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPrimaryMediaPicker(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-muted rounded text-sm hover:bg-muted/80"
                    >
                      <FolderOpen className="h-4 w-4" /> Zgjidh nga Media
                    </button>
                  </div>
                </div>
                <MediaPickerModal
                  open={showPrimaryMediaPicker}
                  onClose={() => setShowPrimaryMediaPicker(false)}
                  onSelect={(urls) => {
                    if (urls[0]) setEditItem((p) => p ? { ...p, image_url: urls[0] } : p);
                  }}
                />
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
