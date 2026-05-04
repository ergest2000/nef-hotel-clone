import { useState, useRef } from "react";
import { useCollections, useDeleteCollection } from "@/hooks/useCollections";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, Edit, FolderOpen, Image as ImageIcon, X } from "lucide-react";
import { MediaPickerModal } from "./MediaPickerModal";
import { TranslateButton } from "./TranslateButton";
import type { Tables } from "@/integrations/supabase/types";

type Collection = Tables<"collections">;

const BASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!BASE_URL || !ANON_KEY) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY environment variables");
}

const SUPABASE_URL = BASE_URL + "/rest/v1/collections";

async function getAuthHeaders() {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token || ANON_KEY;
  return {
    "Content-Type": "application/json",
    "apikey": ANON_KEY,
    "Authorization": "Bearer " + token,
    "Prefer": "return=minimal",
  };
}

async function rawPatch(id: string, payload: Record<string, unknown>) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${SUPABASE_URL}?id=eq.${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
}

async function rawPost(payload: Record<string, unknown>) {
  const headers = await getAuthHeaders();
  const res = await fetch(SUPABASE_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
}

export const AdminCollectionsManager = () => {
  const { data: collections, isLoading } = useCollections();
  const remove = useDeleteCollection();
  const { toast } = useToast();
  const { translateField, translating } = useAutoTranslate();
  const [editItem, setEditItem] = useState<Partial<Collection> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showBrandLogoPicker, setShowBrandLogoPicker] = useState(false);
  const qc = useQueryClient();

  // ── Drag state ──────────────────────────────────────────────────
  const dragId = useRef<string | null>(null);
  const dragOverId = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverIdState, setDragOverIdState] = useState<string | null>(null);

  const topLevel = collections?.filter((c) => !c.parent_id) ?? [];
  const getChildren = (parentId: string) =>
    collections?.filter((c) => c.parent_id === parentId) ?? [];

  // ── Drag handlers ───────────────────────────────────────────────
  const onDragStart = (id: string) => {
    dragId.current = id;
    setDraggingId(id);
  };

  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    dragOverId.current = id;
    setDragOverIdState(id);
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setDragOverIdState(null);
  };

  const onDrop = async (e: React.DragEvent, targetId: string, items: Collection[]) => {
    e.preventDefault();
    const sourceId = dragId.current;
    if (!sourceId || sourceId === targetId) {
      onDragEnd();
      return;
    }

    const sourceIdx = items.findIndex((c) => c.id === sourceId);
    const targetIdx = items.findIndex((c) => c.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) { onDragEnd(); return; }

    // Reorder array
    const reordered = [...items];
    const [moved] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    // Optimistic update in cache
    qc.setQueryData<Collection[]>(["collections"], (old) => {
      if (!old) return old;
      const updated = [...old];
      reordered.forEach((item, idx) => {
        const i = updated.findIndex((c) => c.id === item.id);
        if (i !== -1) updated[i] = { ...updated[i], sort_order: idx };
      });
      return updated;
    });

    // Persist via raw fetch (bypasses RLS issues for editor role)
    try {
      await Promise.all(
        reordered.map((item, idx) => rawPatch(item.id, { sort_order: idx }))
      );
      qc.invalidateQueries({ queryKey: ["collections"] });
    } catch (err: any) {
      toast({ title: "Gabim", description: err.message, variant: "destructive" });
      qc.invalidateQueries({ queryKey: ["collections"] });
    }

    onDragEnd();
  };

  // ── Save (create / update) ──────────────────────────────────────
  const handleSave = async () => {
    if (!editItem?.slug) {
      toast({ title: "Gabim", description: "Slug është i detyrueshëm", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const fields = ["title_al","title_en","description_al","description_en","slug","image_url","parent_id","visible","sort_order","brand_name","brand_logo_url","brand_url"] as const;
      const payload: Record<string, unknown> = {};
      fields.forEach((f) => { if ((editItem as any)[f] !== undefined) payload[f] = (editItem as any)[f]; });

      if (editItem.id) {
        await rawPatch(editItem.id, payload);
      } else {
        await rawPost(payload);
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
    try {
      const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `collections/${Date.now()}-${safeName}`;
      const url = await uploadCmsImage(file, path);
      setEditItem((prev) => prev ? { ...prev, image_url: url } : prev);
      toast({ title: "Imazhi u ngarkua!" });
    } catch (e: any) {
      toast({ title: "Gabim gjatë ngarkimit", description: e.message, variant: "destructive" });
    }
  };

  const openNew = (parentId?: string) => {
    setEditItem({
      title_al: "", title_en: "", description_al: "", description_en: "",
      slug: "", image_url: "", parent_id: parentId || null, visible: true,
      sort_order: collections?.length ?? 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (item: Collection) => { setEditItem({ ...item }); setDialogOpen(true); };

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
          <Card
            key={col.id}
            draggable
            onDragStart={() => onDragStart(col.id)}
            onDragOver={(e) => onDragOver(e, col.id)}
            onDrop={(e) => onDrop(e, col.id, topLevel)}
            onDragEnd={onDragEnd}
            className={[
              "border transition-all duration-150 cursor-default",
              draggingId === col.id ? "opacity-40 scale-[0.98]" : "",
              dragOverIdState === col.id && draggingId !== col.id
                ? "ring-2 ring-primary border-primary"
                : "",
            ].join(" ")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical
                    className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0"
                  />
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

              {/* Sub-collections — drag & drop brenda parent */}
              {(() => {
                const children = getChildren(col.id);
                return (
                  <div className="ml-6 space-y-2">
                    {children.map((sub) => (
                      <div
                        key={sub.id}
                        draggable
                        onDragStart={(e) => { e.stopPropagation(); onDragStart(sub.id); }}
                        onDragOver={(e) => { e.stopPropagation(); onDragOver(e, sub.id); }}
                        onDrop={(e) => { e.stopPropagation(); onDrop(e, sub.id, children); }}
                        onDragEnd={onDragEnd}
                        className={[
                          "flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2 transition-all duration-150",
                          draggingId === sub.id ? "opacity-40 scale-[0.98]" : "",
                          dragOverIdState === sub.id && draggingId !== sub.id
                            ? "ring-2 ring-primary"
                            : "",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
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
                );
              })()}
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
              <div>
                <label className="text-xs font-medium text-muted-foreground">Imazhi</label>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {editItem.image_url && (
                    <div className="relative group">
                      <img src={editItem.image_url} alt="" className="h-16 w-16 object-cover rounded" />
                      <button
                        type="button"
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
                    onClick={() => setShowMediaPicker(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-muted rounded text-sm hover:bg-muted/80"
                  >
                    <FolderOpen className="h-4 w-4" /> Zgjidh nga Media
                  </button>
                </div>
              </div>

              <MediaPickerModal
                open={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                defaultFolder="collections"
                onSelect={(urls) => {
                  if (urls[0]) setEditItem((p) => p ? { ...p, image_url: urls[0] } : p);
                }}
              />

              {/* ── Brand i lidhur (opsional) ──────────────────────────── */}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Brand i lidhur (opsional)
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Plotësoji këto fusha vetëm nëse ky koleksion përfaqëson një brand specifik (p.sh. Media Strom, Groupe GM).
                  Banner-i shfaqet vetëm te faqja e produktit individual.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Emri i brandit</label>
                    <Input
                      value={(editItem as any).brand_name ?? ""}
                      onChange={(e) => setEditItem({ ...editItem, brand_name: e.target.value } as any)}
                      placeholder="p.sh. Media Strom"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">URL i faqes zyrtare</label>
                    <Input
                      value={(editItem as any).brand_url ?? ""}
                      onChange={(e) => setEditItem({ ...editItem, brand_url: e.target.value } as any)}
                      placeholder="https://www.brand.com"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-medium text-muted-foreground">Logoja e brandit</label>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {(editItem as any).brand_logo_url && (
                      <div className="relative group">
                        <img src={(editItem as any).brand_logo_url} alt="" className="h-12 w-auto max-w-[140px] object-contain bg-muted rounded p-1" />
                        <button
                          type="button"
                          onClick={() => setEditItem({ ...editItem, brand_logo_url: "" } as any)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowBrandLogoPicker(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-muted rounded text-sm hover:bg-muted/80"
                    >
                      <FolderOpen className="h-4 w-4" /> Zgjidh logo nga Media
                    </button>
                  </div>
                </div>
              </div>

              <MediaPickerModal
                open={showBrandLogoPicker}
                onClose={() => setShowBrandLogoPicker(false)}
                defaultFolder="logos"
                onSelect={(urls) => {
                  if (urls[0]) setEditItem((p) => p ? ({ ...p, brand_logo_url: urls[0] } as any) : p);
                }}
              />
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
