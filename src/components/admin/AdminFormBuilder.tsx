import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Field {
  id: string;
  field_key: string;
  label: string;
  field_type: string;
  placeholder: string;
  icon: string;
  required: boolean;
  visible: boolean;
  sort_order: number;
}

const iconOptions = ["Building2", "User", "Mail", "Phone", "MapPin", "MessageSquare", "Globe", "Hash", "FileText"];
const typeOptions = ["text", "email", "tel", "textarea", "number", "url"];

const SortableField = ({ field, onUpdate, onDelete }: { field: Field; onUpdate: (f: Field) => void; onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="bg-background border border-border rounded-lg p-4 flex items-start gap-3">
      <button {...attributes} {...listeners} className="mt-2 cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-[10px] uppercase text-muted-foreground tracking-wide">Field Key</label>
          <Input value={field.field_key} onChange={(e) => onUpdate({ ...field, field_key: e.target.value })} className="h-8 text-sm" />
        </div>
        <div>
          <label className="text-[10px] uppercase text-muted-foreground tracking-wide">Label</label>
          <Input value={field.label} onChange={(e) => onUpdate({ ...field, label: e.target.value })} className="h-8 text-sm" />
        </div>
        <div>
          <label className="text-[10px] uppercase text-muted-foreground tracking-wide">Type</label>
          <Select value={field.field_type} onValueChange={(v) => onUpdate({ ...field, field_type: v })}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{typeOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[10px] uppercase text-muted-foreground tracking-wide">Icon</label>
          <Select value={field.icon} onValueChange={(v) => onUpdate({ ...field, icon: v })}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{iconOptions.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[10px] uppercase text-muted-foreground tracking-wide">Placeholder</label>
          <Input value={field.placeholder} onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })} className="h-8 text-sm" />
        </div>
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-xs">
            <Switch checked={field.required} onCheckedChange={(v) => onUpdate({ ...field, required: v })} />
            Required
          </label>
          <label className="flex items-center gap-2 text-xs">
            <Switch checked={field.visible} onCheckedChange={(v) => onUpdate({ ...field, visible: v })} />
            Visible
          </label>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="mt-2 text-destructive h-7 w-7" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export const AdminFormBuilder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const { data: fields = [], isLoading } = useQuery({
    queryKey: ["registration_fields"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registration_fields")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Field[];
    },
  });

  const [localFields, setLocalFields] = useState<Field[]>([]);
  const [dirty, setDirty] = useState(false);

  // Sync from server when data loads
  const currentFields = dirty ? localFields : fields;

  const updateField = (idx: number, updated: Field) => {
    const next = [...currentFields];
    next[idx] = updated;
    setLocalFields(next);
    setDirty(true);
  };

  const deleteField = (idx: number) => {
    const next = currentFields.filter((_, i) => i !== idx);
    setLocalFields(next);
    setDirty(true);
  };

  const addField = () => {
    const next = [
      ...currentFields,
      {
        id: crypto.randomUUID(),
        field_key: `field_${Date.now()}`,
        label: "New Field",
        field_type: "text",
        placeholder: "",
        icon: "Hash",
        required: false,
        visible: true,
        sort_order: currentFields.length,
      },
    ];
    setLocalFields(next);
    setDirty(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (fieldsToSave: Field[]) => {
      // Delete all then re-insert
      await supabase.from("registration_fields").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const inserts = fieldsToSave.map((f, i) => ({
        field_key: f.field_key,
        label: f.label,
        field_type: f.field_type,
        placeholder: f.placeholder,
        icon: f.icon,
        required: f.required,
        visible: f.visible,
        sort_order: i,
      }));
      const { error } = await supabase.from("registration_fields").insert(inserts);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration_fields"] });
      setDirty(false);
      toast({ title: "Forma u ruajt!" });
    },
    onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const arr = [...currentFields];
    const oldIdx = arr.findIndex((f) => f.id === active.id);
    const newIdx = arr.findIndex((f) => f.id === over.id);
    const [moved] = arr.splice(oldIdx, 1);
    arr.splice(newIdx, 0, moved);
    setLocalFields(arr);
    setDirty(true);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Registration Form Builder</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addField}><Plus className="h-4 w-4 mr-1" /> Add Field</Button>
          <Button size="sm" onClick={() => saveMutation.mutate(currentFields)} disabled={!dirty || saveMutation.isPending}>
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={currentFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {currentFields.map((field, idx) => (
              <SortableField
                key={field.id}
                field={field}
                onUpdate={(f) => updateField(idx, f)}
                onDelete={() => deleteField(idx)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
