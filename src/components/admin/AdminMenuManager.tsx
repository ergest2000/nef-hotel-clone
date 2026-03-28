import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save, GripVertical, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface NavMenuItem {
  id: string;
  location: string;
  label: string;
  label_en: string;
  href: string;
  sort_order: number;
  visible: boolean;
}

const useNavMenus = () => {
  return useQuery({
    queryKey: ["nav_menus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nav_menus")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as NavMenuItem[];
    },
  });
};

const locations = [
  { key: "header", label: "Header Menu" },
  { key: "footer_col1", label: "Footer - Company" },
  { key: "footer_col2", label: "Footer - Support" },
];

export const AdminMenuManager = () => {
  const { data: menus, isLoading } = useNavMenus();
  const { toast } = useToast();
  const qc = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor));

  const upsertMutation = useMutation({
    mutationFn: async (item: Partial<NavMenuItem> & { location: string; label: string }) => {
      const { error } = await supabase.from("nav_menus").upsert(item);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nav_menus"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("nav_menus").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nav_menus"] });
      toast({ title: "Menu u fshi!" });
    },
  });

  const handleDragEnd = async (event: any, location: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !menus) return;
    const locationMenus = menus.filter(m => m.location === location);
    const oldIndex = locationMenus.findIndex(m => m.id === active.id);
    const newIndex = locationMenus.findIndex(m => m.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...locationMenus];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    const promises = reordered.map((m, i) =>
      supabase.from("nav_menus").update({ sort_order: i }).eq("id", m.id)
    );
    await Promise.all(promises);
    qc.invalidateQueries({ queryKey: ["nav_menus"] });
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Duke ngarkuar...</p>;

  return (
    <div className="space-y-8">
      <h2 className="text-lg tracking-wide-brand text-foreground font-light uppercase">Menu Management</h2>

      {locations.map(loc => {
        const items = (menus ?? []).filter(m => m.location === loc.key).sort((a, b) => a.sort_order - b.sort_order);
        return (
          <MenuSection
            key={loc.key}
            title={loc.label}
            location={loc.key}
            items={items}
            onAdd={(label, labelEn, href) => {
              upsertMutation.mutate({
                location: loc.key,
                label,
                label_en: labelEn,
                href,
                sort_order: items.length,
                visible: true,
              }, { onSuccess: () => toast({ title: "Menu u shtua!" }) });
            }}
            onDelete={(id) => deleteMutation.mutate(id)}
            onUpdate={(item) => upsertMutation.mutate(item, { onSuccess: () => toast({ title: "Menu u ruajt!" }) })}
            onDragEnd={(e) => handleDragEnd(e, loc.key)}
            sensors={sensors}
          />
        );
      })}
    </div>
  );
};

const MenuSection = ({
  title,
  location,
  items,
  onAdd,
  onDelete,
  onUpdate,
  onDragEnd,
  sensors,
}: {
  title: string;
  location: string;
  items: NavMenuItem[];
  onAdd: (label: string, labelEn: string, href: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (item: Partial<NavMenuItem> & { id: string; location: string; label: string }) => void;
  onDragEnd: (e: any) => void;
  sensors: any;
}) => {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newLabelEn, setNewLabelEn] = useState("");
  const [newHref, setNewHref] = useState("");

  return (
    <div className="border border-border rounded-md bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-xs tracking-brand uppercase font-medium text-foreground">{title}</h3>
        <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setAdding(!adding)}>
          <Plus size={14} className="mr-1" /> Shto
        </Button>
      </div>

      {adding && (
        <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
          <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Emri (AL)" className="text-xs h-8 flex-1" />
          <Input value={newLabelEn} onChange={e => setNewLabelEn(e.target.value)} placeholder="Name (EN)" className="text-xs h-8 flex-1" />
          <Input value={newHref} onChange={e => setNewHref(e.target.value)} placeholder="/path" className="text-xs h-8 flex-1" />
          <Button size="sm" className="h-8 text-xs" onClick={() => {
            if (newLabel) { onAdd(newLabel, newLabelEn || newLabel, newHref || "#"); setNewLabel(""); setNewLabelEn(""); setNewHref(""); setAdding(false); }
          }}>
            <Save size={14} />
          </Button>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map(item => (
            <SortableMenuItem key={item.id} item={item} onDelete={onDelete} onUpdate={onUpdate} />
          ))}
        </SortableContext>
      </DndContext>

      {items.length === 0 && !adding && (
        <p className="px-4 py-6 text-xs text-muted-foreground text-center">Nuk ka menu.</p>
      )}
    </div>
  );
};

const SortableMenuItem = ({
  item,
  onDelete,
  onUpdate,
}: {
  item: NavMenuItem;
  onDelete: (id: string) => void;
  onUpdate: (item: Partial<NavMenuItem> & { id: string; location: string; label: string }) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(item.label);
  const [labelEn, setLabelEn] = useState(item.label_en || "");
  const [href, setHref] = useState(item.href);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 px-4 py-2 border-b border-border last:border-0">
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical size={14} />
      </button>

      {editing ? (
        <>
          <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="AL" className="text-xs h-8 flex-1" />
          <Input value={labelEn} onChange={e => setLabelEn(e.target.value)} placeholder="EN" className="text-xs h-8 flex-1" />
          <Input value={href} onChange={e => setHref(e.target.value)} className="text-xs h-8 flex-1" />
          <Button size="sm" className="h-8 text-xs" onClick={() => {
            onUpdate({ id: item.id, location: item.location, label, label_en: labelEn, href });
            setEditing(false);
          }}>
            <Save size={14} />
          </Button>
        </>
      ) : (
        <>
          <span className="text-xs text-foreground flex-1 cursor-pointer" onClick={() => setEditing(true)}>
            {item.label}
            {item.label_en && item.label_en !== item.label && (
              <span className="text-muted-foreground ml-1.5">/ {item.label_en}</span>
            )}
          </span>
          <span className="text-[10px] text-muted-foreground">{item.href}</span>
        </>
      )}

      <button
        onClick={() => onUpdate({ ...item, visible: !item.visible })}
        className={`p-1 rounded ${item.visible ? "text-primary" : "text-muted-foreground"}`}
      >
        {item.visible ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
      <button onClick={() => onDelete(item.id)} className="p-1 text-destructive hover:text-destructive">
        <Trash2 size={14} />
      </button>
    </div>
  );
};
