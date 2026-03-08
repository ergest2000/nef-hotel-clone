import { useState, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  GripVertical,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Save,
  Upload,
  Image as ImageIcon,
  Type,
  Link as LinkIcon,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;
type SiteSection = Tables<"site_sections">;

const pageLabels: Record<string, string> = {
  home: "Faqja Kryesore",
  company: "Rreth Nesh",
  clients: "Klientët",
  "tailor-made": "Tailor Made",
  contact: "Kontakti",
  blog: "Blog",
};

const typeIcons: Record<string, typeof Type> = {
  text: Type,
  image: ImageIcon,
  link: LinkIcon,
  html: Type,
};

interface AdminPageEditorProps {
  page: string;
  sections: SiteSection[];
  content: SiteContent[];
  lang: string;
  onSaveField: (item: SiteContent, newValue: string) => void;
  onUploadImage: (item: SiteContent, file: File) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onDragEnd: (event: any) => void;
}

export const AdminPageEditor = ({
  page,
  sections,
  content,
  lang,
  onSaveField,
  onUploadImage,
  onToggleVisibility,
  onDragEnd,
}: AdminPageEditorProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <div>
      <h2 className="text-lg tracking-wide-brand text-foreground font-light mb-6 uppercase">
        {pageLabels[page] || page}
      </h2>

      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nuk ka seksione për këtë faqe.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                content={content}
                lang={lang}
                onToggleVisibility={onToggleVisibility}
                onSaveField={onSaveField}
                onUploadImage={onUploadImage}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

const SortableSection = ({
  section,
  content,
  lang,
  onToggleVisibility,
  onSaveField,
  onUploadImage,
}: {
  section: SiteSection;
  content: SiteContent[];
  lang: string;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onSaveField: (item: SiteContent, newValue: string) => void;
  onUploadImage: (item: SiteContent, file: File) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sectionContent = content.filter(
    (c) => c.section_key === section.section_key && c.page === section.page
  );

  return (
    <div ref={setNodeRef} style={style} className="border border-border bg-background mb-2 rounded-md">
      <div className="flex items-center gap-2 px-4 py-3">
        <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
          <GripVertical size={18} />
        </button>
        <button onClick={() => setExpanded(!expanded)} className="flex-1 flex items-center gap-2 text-left">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="text-xs tracking-brand uppercase text-foreground font-medium">
            {section.section_key}
          </span>
          <span className="text-[10px] text-muted-foreground ml-2">
            ({sectionContent.length} fields)
          </span>
        </button>
        <button
          onClick={() => onToggleVisibility(section.id, !section.visible)}
          className={`p-1 rounded ${section.visible ? "text-primary" : "text-muted-foreground"}`}
        >
          {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {sectionContent.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nuk ka përmbajtje ({lang.toUpperCase()})</p>
          ) : (
            sectionContent.map((item) => (
              <ContentField key={item.id} item={item} onSave={onSaveField} onUploadImage={onUploadImage} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const ContentField = ({
  item,
  onSave,
  onUploadImage,
}: {
  item: SiteContent;
  onSave: (item: SiteContent, newValue: string) => void;
  onUploadImage: (item: SiteContent, file: File) => void;
}) => {
  const [value, setValue] = useState(item.value || "");
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const Icon = typeIcons[item.content_type] || Type;

  const handleChange = (v: string) => {
    setValue(v);
    setDirty(v !== (item.value || ""));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-muted-foreground" />
        <label className="text-[10px] tracking-brand text-muted-foreground uppercase flex-1">
          {item.field_key}
        </label>
        <span className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
          {item.content_type}
        </span>
      </div>

      {item.content_type === "image" ? (
        <div className="flex items-center gap-3">
          {value && !value.startsWith("/src/") && (
            <img src={value} alt="" className="w-16 h-16 object-cover border border-border rounded" />
          )}
          <div className="flex-1 flex gap-2">
            <Input value={value} onChange={(e) => handleChange(e.target.value)} className="text-xs h-9 flex-1" placeholder="URL e imazhit" />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadImage(item, f); }} />
            <Button variant="outline" size="sm" className="h-9 text-[10px]" onClick={() => fileRef.current?.click()}>
              <Upload size={14} />
            </Button>
          </div>
          {dirty && (
            <Button size="sm" className="h-9 text-[10px]" onClick={() => { onSave(item, value); setDirty(false); }}>
              <Save size={14} />
            </Button>
          )}
        </div>
      ) : item.content_type === "html" || (value && value.length > 100) ? (
        <div className="flex gap-2">
          <Textarea value={value} onChange={(e) => handleChange(e.target.value)} className="text-xs min-h-[80px] flex-1" />
          {dirty && (
            <Button size="sm" className="h-9 text-[10px] self-end" onClick={() => { onSave(item, value); setDirty(false); }}>
              <Save size={14} />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <Input value={value} onChange={(e) => handleChange(e.target.value)} className="text-xs h-9 flex-1" />
          {dirty && (
            <Button size="sm" className="h-9 text-[10px]" onClick={() => { onSave(item, value); setDirty(false); }}>
              <Save size={14} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
