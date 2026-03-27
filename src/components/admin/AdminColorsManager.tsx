import { useState } from "react";
import {
  useGlobalColors, useAddGlobalColor, useUpdateGlobalColor, useDeleteGlobalColor,
  type GlobalColor,
} from "@/hooks/useCollections";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Palette } from "lucide-react";

const emptyColor: Omit<GlobalColor, "id" | "created_at"> = {
  name_al: "",
  name_en: "",
  hex: "#FFFFFF",
  sort_order: 0,
};

export const AdminColorsManager = () => {
  const { data: colors, isLoading } = useGlobalColors();
  const add = useAddGlobalColor();
  const update = useUpdateGlobalColor();
  const remove = useDeleteGlobalColor();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<GlobalColor>>(emptyColor);
  const [isEditing, setIsEditing] = useState(false);

  const openNew = () => {
    setEditItem({ ...emptyColor, sort_order: colors?.length ?? 0 });
    setIsEditing(false);
    setDialogOpen(true);
  };

  const openEdit = (c: GlobalColor) => {
    setEditItem({ ...c });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editItem.name_al?.trim() || !editItem.name_en?.trim()) {
      toast({ title: "Gabim", description: "Emri AL dhe EN janë të detyrueshëm", variant: "destructive" });
      return;
    }
    if (isEditing && editItem.id) {
      update.mutate(
        { id: editItem.id, updates: { name_al: editItem.name_al, name_en: editItem.name_en, hex: editItem.hex, sort_order: editItem.sort_order } },
        {
          onSuccess: () => { toast({ title: "U ruajt!" }); setDialogOpen(false); },
          onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
        }
      );
    } else {
      add.mutate(
        { name_al: editItem.name_al!, name_en: editItem.name_en!, hex: editItem.hex ?? "#FFFFFF", sort_order: editItem.sort_order ?? 0 },
        {
          onSuccess: () => { toast({ title: "U shtua!" }); setDialogOpen(false); },
          onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Jeni i sigurt? Kjo do të heqë ngjyrën nga të gjithë produktet.")) return;
    remove.mutate(id, {
      onSuccess: () => toast({ title: "U fshi!" }),
      onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Ngjyrat e Produktit</h2>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Shto Ngjyrë
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !colors?.length ? (
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">Nuk ka ngjyra të shtuara ende.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={openNew}>
            <Plus className="h-4 w-4 mr-1" /> Shto ngjyrën e parë
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {colors.map((color) => (
            <Card key={color.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-3 flex flex-col items-center gap-2">
                {/* Color swatch */}
                <div
                  className="w-14 h-14 rounded-full border-2 border-border shadow-sm"
                  style={{ backgroundColor: color.hex }}
                />
                {/* Names */}
                <div className="text-center">
                  <p className="text-xs font-semibold text-foreground leading-tight">{color.name_al}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{color.name_en}</p>
                  <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">{color.hex.toUpperCase()}</p>
                </div>
                {/* Actions */}
                <div className="flex gap-1 mt-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(color)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(color.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Ndrysho Ngjyrën" : "Ngjyrë e Re"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Color picker + preview */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full border-2 border-border shadow-inner shrink-0"
                style={{ backgroundColor: editItem.hex }}
              />
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Ngjyra (HEX)</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={editItem.hex ?? "#FFFFFF"}
                    onChange={(e) => setEditItem({ ...editItem, hex: e.target.value })}
                    className="w-10 h-9 p-0.5 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={editItem.hex ?? ""}
                    onChange={(e) => setEditItem({ ...editItem, hex: e.target.value })}
                    placeholder="#FFFFFF"
                    className="h-9 text-xs font-mono flex-1"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>

            {/* Names */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Emri Shqip</label>
              <Input
                value={editItem.name_al ?? ""}
                onChange={(e) => setEditItem({ ...editItem, name_al: e.target.value })}
                placeholder="p.sh. Kuqe"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Emri Anglisht</label>
              <Input
                value={editItem.name_en ?? ""}
                onChange={(e) => setEditItem({ ...editItem, name_en: e.target.value })}
                placeholder="p.sh. Red"
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Anulo</Button>
              <Button onClick={handleSave} disabled={add.isPending || update.isPending}>
                {add.isPending || update.isPending ? "Duke ruajtur..." : "Ruaj"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
