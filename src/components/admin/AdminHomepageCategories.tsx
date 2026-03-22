import { useState } from "react";
import { useHomepageCategories, useUpsertHomepageCategory, useDeleteHomepageCategory, type HomepageCategory } from "@/hooks/useHomepageCategories";
import { useToast } from "@/hooks/use-toast";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { uploadCmsImage } from "@/hooks/useCms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Image as ImageIcon } from "lucide-react";
import { TranslateButton } from "./TranslateButton";

const empty: Partial<HomepageCategory> = { title_al: "", title_en: "", image_url: "", link_url: "#", visible: true, sort_order: 0 };

export const AdminHomepageCategories = () => {
  const { data: categories, isLoading } = useHomepageCategories();
  const upsert = useUpsertHomepageCategory();
  const remove = useDeleteHomepageCategory();
  const { toast } = useToast();
  const { translateField, translating } = useAutoTranslate();
  const [editItem, setEditItem] = useState<Partial<HomepageCategory> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSave = () => {
    if (!editItem?.title_al && !editItem?.title_en) {
      toast({ title: "Gabim", description: "Shto titullin", variant: "destructive" });
      return;
    }
    upsert.mutate(editItem as any, {
      onSuccess: () => { toast({ title: "U ruajt!" }); setDialogOpen(false); },
      onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Jeni i sigurt?")) return;
    remove.mutate(id, { onSuccess: () => toast({ title: "U fshi!" }) });
  };

  const handleImageUpload = async (file: File) => {
    const path = `categories/${Date.now()}-${file.name}`;
    const url = await uploadCmsImage(file, path);
    setEditItem((p) => p ? { ...p, image_url: url } : p);
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">Duke ngarkuar...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Kategoritë e Homepage</h2>
          <p className="text-sm text-muted-foreground mt-1">Menaxho kategoritë që shfaqen në homepage</p>
        </div>
        <Button size="sm" onClick={() => { setEditItem({ ...empty, sort_order: categories?.length ?? 0 }); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Shto Kategori
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories?.map((cat) => (
          <Card key={cat.id} className="overflow-hidden">
            <div className="relative aspect-square bg-muted">
              {cat.image_url ? <img src={cat.image_url} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><ImageIcon className="h-8 w-8 text-muted-foreground/30" /></div>}
              {!cat.visible && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><span className="text-xs text-muted-foreground">Fshehur</span></div>}
            </div>
            <CardContent className="p-3 space-y-1">
              <p className="text-sm font-medium">{cat.title_al}</p>
              <p className="text-xs text-muted-foreground truncate">{cat.link_url}</p>
              <div className="flex gap-1 pt-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditItem({ ...cat }); setDialogOpen(true); }}><Edit className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(cat.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem?.id ? "Ndrysho Kategorinë" : "Kategori e Re"}</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Titulli (AL)</label>
                    <TranslateButton direction="al_to_en" loading={translating === "cat_title"} onClick={() => translateField("cat_title", editItem.title_al ?? "", "al_to_en", (t) => setEditItem((p) => p ? { ...p, title_en: t } : p))} />
                  </div>
                  <Input value={editItem.title_al ?? ""} onChange={(e) => setEditItem({ ...editItem, title_al: e.target.value })} />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Title (EN)</label>
                    <TranslateButton direction="en_to_al" loading={translating === "cat_title_r"} onClick={() => translateField("cat_title_r", editItem.title_en ?? "", "en_to_al", (t) => setEditItem((p) => p ? { ...p, title_al: t } : p))} />
                  </div>
                  <Input value={editItem.title_en ?? ""} onChange={(e) => setEditItem({ ...editItem, title_en: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Link URL</label>
                <Input value={editItem.link_url ?? "#"} onChange={(e) => setEditItem({ ...editItem, link_url: e.target.value })} placeholder="/koleksionet/bedroom" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Imazhi</label>
                <div className="flex items-center gap-3 mt-1">
                  {editItem.image_url && <img src={editItem.image_url} className="h-20 w-20 object-cover rounded" />}
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded text-sm hover:bg-muted/80"><ImageIcon className="h-4 w-4" /> Ngarko</div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }} />
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={editItem.visible ?? true} onCheckedChange={(v) => setEditItem({ ...editItem, visible: v })} />
                <span className="text-sm">I dukshëm</span>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Renditja</label>
                <Input type="number" value={editItem.sort_order ?? 0} onChange={(e) => setEditItem({ ...editItem, sort_order: parseInt(e.target.value) || 0 })} className="w-24" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Anulo</Button>
                <Button onClick={handleSave} disabled={upsert.isPending}>{upsert.isPending ? "Duke ruajtur..." : "Ruaj"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
