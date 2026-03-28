import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, Edit, ExternalLink } from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
}

interface ColumnConfig {
  prefix: string;
  titleKey_al: string;
  titleKey_en: string;
  defaultTitle_al: string;
  defaultTitle_en: string;
  description: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    prefix: "col1",
    titleKey_al: "col1_title_al",
    titleKey_en: "col1_title_en",
    defaultTitle_al: "KOMPANIA",
    defaultTitle_en: "COMPANY",
    description: "Kolona e parë e footer-it",
  },
  {
    prefix: "col3",
    titleKey_al: "col3_title_al",
    titleKey_en: "col3_title_en",
    defaultTitle_al: "NDIHME",
    defaultTitle_en: "SUPPORT",
    description: "Kolona e tretë e footer-it",
  },
];

// Fetch all footer content from site_content
const useFooterContent = () =>
  useQuery({
    queryKey: ["site_content", "home", "al"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("page", "home")
        .eq("section_key", "footer")
        .eq("lang", "al");
      if (error) throw error;
      return data;
    },
  });

const getVal = (content: any[] | undefined, fieldKey: string, fallback: string = ""): string => {
  if (!content) return fallback;
  const item = content.find((c: any) => c.field_key === fieldKey);
  return item?.value ?? fallback;
};

// Single column manager with drag-and-drop
const FooterColumnManager = ({
  column,
  content,
}: {
  column: ColumnConfig;
  content: any[] | undefined;
}) => {
  const { toast } = useToast();
  const qc = useQueryClient();

  // Parse links from content
  const parseLinks = useCallback((): FooterLink[] => {
    const count = parseInt(getVal(content, column.prefix + "_count", "0")) || 0;
    const links: FooterLink[] = [];
    for (let i = 1; i <= count; i++) {
      const label = getVal(content, column.prefix + "_link" + i + "_label", "");
      const href = getVal(content, column.prefix + "_link" + i + "_href", "#");
      if (label) links.push({ label, href });
    }
    return links;
  }, [content, column.prefix]);

  const [links, setLinks] = useState<FooterLink[]>([]);
  const [editDialog, setEditDialog] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editHref, setEditHref] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  useEffect(() => {
    setLinks(parseLinks());
  }, [parseLinks]);

  // Save all links to DB
  const saveLinks = async (newLinks: FooterLink[]) => {
    setSaving(true);
    try {
      // Upsert count
      await supabase.from("site_content").upsert(
        {
          page: "home",
          section_key: "footer",
          field_key: column.prefix + "_count",
          lang: "al",
          content_type: "text",
          value: String(newLinks.length),
          sort_order: 0,
        },
        { onConflict: "page,section_key,field_key,lang" }
      );

      // Upsert each link
      for (let i = 0; i < newLinks.length; i++) {
        await supabase.from("site_content").upsert(
          {
            page: "home",
            section_key: "footer",
            field_key: column.prefix + "_link" + (i + 1) + "_label",
            lang: "al",
            content_type: "text",
            value: newLinks[i].label,
            sort_order: i,
          },
          { onConflict: "page,section_key,field_key,lang" }
        );
        await supabase.from("site_content").upsert(
          {
            page: "home",
            section_key: "footer",
            field_key: column.prefix + "_link" + (i + 1) + "_href",
            lang: "al",
            content_type: "text",
            value: newLinks[i].href,
            sort_order: i,
          },
          { onConflict: "page,section_key,field_key,lang" }
        );
      }

      // Clear old extra links (if reduced count)
      for (let i = newLinks.length + 1; i <= 10; i++) {
        await supabase
          .from("site_content")
          .delete()
          .eq("page", "home")
          .eq("section_key", "footer")
          .eq("field_key", column.prefix + "_link" + i + "_label")
          .eq("lang", "al");
        await supabase
          .from("site_content")
          .delete()
          .eq("page", "home")
          .eq("section_key", "footer")
          .eq("field_key", column.prefix + "_link" + i + "_href")
          .eq("lang", "al");
      }

      qc.invalidateQueries({ queryKey: ["site_content"] });
      toast({ title: "U ruajt!" });
    } catch (e: any) {
      toast({ title: "Gabim", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleAdd = () => {
    setEditIndex(null);
    setEditLabel("");
    setEditHref("/");
    setEditDialog(true);
  };

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setEditLabel(links[idx].label);
    setEditHref(links[idx].href);
    setEditDialog(true);
  };

  const handleSaveItem = () => {
    if (!editLabel.trim()) return;
    const newLinks = [...links];
    if (editIndex !== null) {
      newLinks[editIndex] = { label: editLabel.trim(), href: editHref.trim() || "#" };
    } else {
      newLinks.push({ label: editLabel.trim(), href: editHref.trim() || "#" });
    }
    setLinks(newLinks);
    saveLinks(newLinks);
    setEditDialog(false);
  };

  const handleDelete = (idx: number) => {
    const newLinks = links.filter((_, i) => i !== idx);
    setLinks(newLinks);
    saveLinks(newLinks);
  };

  // Drag handlers (native HTML5)
  const handleDragStart = (idx: number) => {
    setDragIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  };

  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }
    const newLinks = [...links];
    const [moved] = newLinks.splice(dragIdx, 1);
    newLinks.splice(idx, 0, moved);
    setLinks(newLinks);
    saveLinks(newLinks);
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  const colTitle = getVal(content, column.titleKey_al, column.defaultTitle_al);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm text-foreground">{colTitle}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{column.description}</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleAdd} disabled={links.length >= 10}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Shto
        </Button>
      </div>

      {links.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">Nuk ka linqe. Kliko "Shto" për të filluar.</p>
      ) : (
        <div className="space-y-1">
          {links.map((link, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md border transition-all cursor-grab active:cursor-grabbing ${
                dragIdx === idx
                  ? "opacity-40 border-primary bg-primary/5"
                  : overIdx === idx && dragIdx !== null
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted/50"
              }`}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              <span className="text-xs font-medium text-muted-foreground w-5 shrink-0">{idx + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{link.label}</p>
                <p className="text-[10px] text-muted-foreground font-mono truncate">{link.href}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(idx)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(idx)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {saving && (
        <p className="text-xs text-primary mt-3 animate-pulse">Duke ruajtur...</p>
      )}

      {/* Edit/Add dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? "Ndrysho Linkun" : "Shto Link të Ri"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Emri (Label)</label>
              <Input
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="p.sh. Rreth Nesh"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">URL (href)</label>
              <Input
                value={editHref}
                onChange={(e) => setEditHref(e.target.value)}
                placeholder="p.sh. /company ose https://..."
                className="font-mono text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditDialog(false)}>Anulo</Button>
              <Button onClick={handleSaveItem} disabled={!editLabel.trim()}>Ruaj</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export const AdminFooterManager = () => {
  const { data: content } = useFooterContent();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Menaxho Menunë e Footer-it</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tërhiq dhe lësho për të ndryshuar renditjen e linqeve. Kolona "Produktet" merret automatikisht nga kategoritë e header-it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {COLUMNS.map((col) => (
          <FooterColumnManager key={col.prefix} column={col} content={content} />
        ))}
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground">
          <strong>Shënim:</strong> Kolona "PRODUKTET" sinkronizohet automatikisht me kategoritë e header-it. 
          Kolona "KONTAKT" menaxhohet te Design Settings (email, telefon, adresë).
        </p>
      </div>
    </div>
  );
};
