import { useState } from "react";
import { useCollections, useUpsertCollection, useDeleteCollection, useUpdateCollectionOrder } from "@/hooks/useCollections";
import { useToast } from "@/hooks/use-toast";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { uploadCmsImage } from "@/hooks/useCms";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, Edit, Eye, EyeOff, FolderOpen, Image as ImageIcon } from "lucide-react";
import { TranslateButton } from "./TranslateButton";
import type { Tables } from "@/integrations/supabase/types";

type Collection = Tables<"collections">;

export const AdminCollectionsManager = () => {
  const { data: collections, isLoading } = useCollections();
  const upsert = useUpsertCollection();
  const remove = useDeleteCollection();
  const updateOrder = useUpdateCollectionOrder();
  const { toast } = useToast();
  const { translateField, translating } = useAutoTranslate();
  const [editItem, setEditItem] = useState<Partial<Collection> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const topLevel = collections?.filter((c) => !c.parent_id) ?? [];
  const getChildren = (parentId: string) => collections?.filter((c) => c.parent_id === parentId) ?? [];

  const handleSave = async () => {
    if (!editItem?.slug) {
      toast({ title: "Gabim", description: "Slug është i detyrueshëm", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload: any = {};
      const fields = ['title_al','title_en','description_al','description_en','slug','image_url','parent_id','visible','sort_order'];
      fields.forEach(f => { if ((editItem as any)[f] !== undefined) payload[f] = (editItem as any)[f]; });

      const url = (import.meta.env.VITE_SUPABASE_URL || "https://yvkwkrumopgspyohrgio.supabase.co") + "/rest/v1/collections";
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2a3drcnVtb3Bnc3B5b2hyZ2lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTU1NzMsImV4cCI6MjA4ODU3MTU3M30.xjSZ7U-Fqdg_lf66YaEem1Wi5W5h4kO1ab1vezV8XIc";
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || key;

      if (editItem.id) {
        const res = await fetch(url + "?id=eq." + editItem.id, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "apikey": key, "Authorization": "Bearer " + token, "Prefer": "return=minimal" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) { const t = await res.text(); throw new Error(t); }
      } else {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": key, "Authorization": "Bearer " + token, "Prefer": "return=minimal" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) { const t = await res.text(); throw new Error(t); }
      }
      qc.invalidateQueries({ queryKey: ["collections"] });
      toast({ title: "U ruajt!" });
      setDialogOpen(false);
      setEditItem(null);
    } catch (e: any) {
      toast({ title: "Gabim", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Jeni i sigurt?")) return;
    remove.mutate(id, {
      onSuccess: () => toast({ title: "U fshi!" }),
      onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
    });
  };

  const handleImageUpload = async (file: File) => {
    const path = `collections/${Date.now()}-${file.name}`;
    const url = await uploadCmsImage(file, path);
    setEditItem((prev) => prev ? { ...prev, image_url: url } : prev);
  };

  const openNew = (parentId?: string) => {
    setEditItem({
      title_al: "",
      title_en: "",
      description_al: "",
      description_en: "",
      slug: "",
      image_url: "",
      parent_id: parentId || null,
      visible: true,
      sort_order: (collections?.length ?? 0),
    });
    setDialogOpen(true);
  };

  const openEdit = (item: Collection) => {
    setEditItem({ ...item });
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Koleksionet</h2>
        <Button onClick={() => openNew()} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Shto Koleksion
        </Button>
      </div>

      {topLevel.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nuk ka koleksione. Shtoni një koleksion të ri.</p>
        </div>
      )}

      <div className="space-y-4">
        {topLevel.map((col) => (
          <Card key={col.id} className="border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  {col.image_url && (
                    <img src={col.image_url} alt="" className="h-12 w-12 object-cover rounded" />
                  )}
                  <div>
                    <CardTitle className="text-base">{col.title_al || col.title_en || col.slug}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">/{col.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={col.visible ? "default" : "secondary"}>
                    {col.visible ? "Aktiv" : "Fshehur"}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(col)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(col.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {col.description_al && (
                <p className="text-sm text-muted-foreground mb-3">{col.description_al}</p>
              )}
              {/* Sub-collections */}
              <div className="ml-6 space-y-2">
                {getChildren(col.id).map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <span className="text-sm font-medium">{sub.title_al || sub.slug}</span>
                      <span className="text-xs text-muted-foreground">/{sub.slug}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(sub)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(sub.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="text-xs" onClick={() => openNew(col.id)}>
                  <Plus className="h-3 w-3 mr-1" /> Nënkoleksion
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit / Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem?.id ? "Ndrysho Koleksionin" : "Koleksion i Ri"}</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Titulli (AL)</label>
                    <TranslateButton
                      direction="al_to_en"
                      loading={translating === "col_title"}
                      onClick={() => translateField("col_title", editItem.title_al ?? "", "al_to_en", (t) => setEditItem({ ...editItem, title_en: t }))}
                    />
                  </div>
                  <Input value={editItem.title_al ?? ""} onChange={(e) => setEditItem({ ...editItem, title_al: e.target.value })} />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Title (EN)</label>
                    <TranslateButton
                      direction="en_to_al"
                      loading={translating === "col_title_rev"}
                      onClick={() => translateField("col_title_rev", editItem.title_en ?? "", "en_to_al", (t) => setEditItem({ ...editItem, title_al: t }))}
                    />
                  </div>
                  <Input value={editItem.title_en ?? ""} onChange={(e) => setEditItem({ ...editItem, title_en: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Përshkrimi (AL)</label>
                    <TranslateButton
                      direction="al_to_en"
                      loading={translating === "col_desc"}
                      onClick={() => translateField("col_desc", editItem.description_al ?? "", "al_to_en", (t) => setEditItem({ ...editItem, description_en: t }))}
                    />
                  </div>
                  <Textarea value={editItem.description_al ?? ""} onChange={(e) => setEditItem({ ...editItem, description_al: e.target.value })} rows={3} />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Description (EN)</label>
                    <TranslateButton
                      direction="en_to_al"
                      loading={translating === "col_desc_rev"}
                      onClick={() => translateField("col_desc_rev", editItem.description_en ?? "", "en_to_al", (t) => setEditItem({ ...editItem, description_al: t }))}
                    />
                  </div>
                  <Textarea value={editItem.description_en ?? ""} onChange={(e) => setEditItem({ ...editItem, description_en: e.target.value })} rows={3} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Slug (URL)</label>
                  <Input value={editItem.slug ?? ""} onChange={(e) => setEditItem({ ...editItem, slug: e.target.value })} placeholder="p.sh. peshqiret" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Parent</label>
                  <Select
                    value={editItem.parent_id ?? "none"}
                    onValueChange={(v) => setEditItem({ ...editItem, parent_id: v === "none" ? null : v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Asnjë (Top-level)</SelectItem>
                      {collections?.filter((c) => !c.parent_id && c.id !== editItem.id).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.title_al || c.slug}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Image */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Imazhi</label>
                <div className="flex items-center gap-3 mt-1">
                  {editItem.image_url && (
                    <img src={editItem.image_url} alt="" className="h-16 w-16 object-cover rounded" />
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
              <div className="flex items-center gap-2">
                <Switch
                  checked={editItem.visible ?? true}
                  onCheckedChange={(v) => setEditItem({ ...editItem, visible: v })}
                />
                <span className="text-sm">I dukshëm</span>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Anulo</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Duke ruajtur..." : "Ruaj"}
                </Button>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
