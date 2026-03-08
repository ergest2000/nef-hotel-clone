import { useState, useRef } from "react";
import { useManagedLogos, useUpsertLogo, useDeleteLogo, useReorderLogos, type ManagedLogo } from "@/hooks/useManagedLogos";
import { uploadCmsImage } from "@/hooks/useCms";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, GripVertical, Upload, Plus, Image as ImageIcon } from "lucide-react";
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

interface Props {
  category: "clients" | "certifications";
  title: string;
}

const SortableLogoItem = ({
  logo,
  onDelete,
  onReplaceLogo,
  onUpdateName,
}: {
  logo: ManagedLogo;
  onDelete: (id: string) => void;
  onReplaceLogo: (logo: ManagedLogo, file: File) => void;
  onUpdateName: (logo: ManagedLogo, name: string) => void;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: logo.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg">
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="w-16 h-12 border border-border rounded flex items-center justify-center bg-muted/30 overflow-hidden shrink-0">
        {logo.logo_url ? (
          <img src={logo.logo_url} alt={logo.name} className="max-w-full max-h-full object-contain" />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
        )}
      </div>
      <Input
        value={logo.name}
        onChange={(e) => onUpdateName(logo, e.target.value)}
        className="flex-1 h-9 text-sm"
      />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onReplaceLogo(logo, f);
      }} />
      <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
        <Upload className="h-3.5 w-3.5" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => onDelete(logo.id)} className="text-destructive hover:text-destructive">
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export const AdminLogoManager = ({ category, title }: Props) => {
  const { data: logos, isLoading } = useManagedLogos(category);
  const upsert = useUpsertLogo();
  const deleteLogo = useDeleteLogo();
  const reorder = useReorderLogos();
  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleAdd = () => {
    if (!newName.trim()) return;
    upsert.mutate(
      { category, name: newName.trim(), sort_order: (logos?.length ?? 0) },
      {
        onSuccess: () => { setNewName(""); toast({ title: "U shtua!" }); },
        onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteLogo.mutate(id, {
      onSuccess: () => toast({ title: "U fshi!" }),
      onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
    });
  };

  const handleReplaceLogo = async (logo: ManagedLogo, file: File) => {
    try {
      const path = `logos/${category}/${Date.now()}-${file.name}`;
      const url = await uploadCmsImage(file, path);
      upsert.mutate({ id: logo.id, category: logo.category, name: logo.name, logo_url: url }, {
        onSuccess: () => toast({ title: "Logo u ngarkua!" }),
      });
    } catch (e: any) {
      toast({ title: "Gabim", description: e.message, variant: "destructive" });
    }
  };

  const handleUpdateName = (logo: ManagedLogo, name: string) => {
    upsert.mutate({ id: logo.id, category: logo.category, name });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !logos) return;
    const oldIdx = logos.findIndex((l) => l.id === active.id);
    const newIdx = logos.findIndex((l) => l.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = [...logos];
    const [moved] = reordered.splice(oldIdx, 1);
    reordered.splice(newIdx, 0, moved);
    reorder.mutate(reordered.map((l, i) => ({ id: l.id, sort_order: i })));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
      <div className="flex gap-2 mb-4">
        <Input placeholder="Emri i ri..." value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="max-w-xs" />
        <Button onClick={handleAdd} size="sm"><Plus className="h-4 w-4 mr-1" /> Shto</Button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={logos?.map((l) => l.id) ?? []} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {logos?.map((logo) => (
              <SortableLogoItem key={logo.id} logo={logo} onDelete={handleDelete} onReplaceLogo={handleReplaceLogo} onUpdateName={handleUpdateName} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {(!logos || logos.length === 0) && <p className="text-sm text-muted-foreground mt-4">Nuk ka logo ende.</p>}
    </div>
  );
};
