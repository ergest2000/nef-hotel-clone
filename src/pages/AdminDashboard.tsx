import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useAllContent,
  useAllSections,
  useUpsertContent,
  useUpdateSectionOrder,
  useToggleSectionVisibility,
  uploadCmsImage,
} from "@/hooks/useCms";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  LogOut,
  Save,
  Eye,
  EyeOff,
  GripVertical,
  Upload,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Type,
  Link as LinkIcon,
} from "lucide-react";
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
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;
type SiteSection = Tables<"site_sections">;

// Content type icons
const typeIcons: Record<string, typeof Type> = {
  text: Type,
  image: ImageIcon,
  link: LinkIcon,
  html: Type,
};

// Sortable section component
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
    <div ref={setNodeRef} style={style} className="border border-border bg-background mb-2">
      <div className="flex items-center gap-2 px-4 py-3">
        <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
          <GripVertical size={18} />
        </button>
        <button onClick={() => setExpanded(!expanded)} className="flex-1 flex items-center gap-2 text-left">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="text-xs tracking-brand uppercase text-foreground font-medium">
            {section.page} → {section.section_key}
          </span>
          <span className="text-[10px] text-muted-foreground ml-2">
            ({sectionContent.length} fields)
          </span>
        </button>
        <button
          onClick={() => onToggleVisibility(section.id, !section.visible)}
          className={`p-1 rounded ${section.visible ? "text-primary" : "text-muted-foreground"}`}
          title={section.visible ? "Fshih seksionin" : "Shfaq seksionin"}
        >
          {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {sectionContent.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nuk ka përmbajtje për këtë seksion në gjuhën {lang.toUpperCase()}</p>
          ) : (
            sectionContent.map((item) => (
              <ContentField
                key={item.id}
                item={item}
                onSave={onSaveField}
                onUploadImage={onUploadImage}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Single content field editor
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
          {value && (
            <img src={value} alt="" className="w-16 h-16 object-cover border border-border" />
          )}
          <div className="flex-1 flex gap-2">
            <Input
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              className="text-xs h-9 flex-1"
              placeholder="URL e imazhit"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadImage(item, f);
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-[10px]"
              onClick={() => fileRef.current?.click()}
            >
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
          <Textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="text-xs min-h-[80px] flex-1"
          />
          {dirty && (
            <Button size="sm" className="h-9 text-[10px] self-end" onClick={() => { onSave(item, value); setDirty(false); }}>
              <Save size={14} />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="text-xs h-9 flex-1"
          />
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

// Main admin dashboard
const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [lang, setLang] = useState<"al" | "en">("al");
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: content, isLoading: loadingContent } = useAllContent(lang);
  const { data: sections, isLoading: loadingSections } = useAllSections();
  const upsertContent = useUpsertContent();
  const updateOrder = useUpdateSectionOrder();
  const toggleVisibility = useToggleSectionVisibility();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSaveField = useCallback(
    (item: SiteContent, newValue: string) => {
      upsertContent.mutate(
        {
          page: item.page,
          section_key: item.section_key,
          field_key: item.field_key,
          lang: item.lang,
          content_type: item.content_type,
          value: newValue,
          sort_order: item.sort_order,
        },
        {
          onSuccess: () => toast({ title: "U ruajt!", description: `${item.field_key} u përditësua.` }),
          onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
        }
      );
    },
    [upsertContent, toast]
  );

  const handleUploadImage = useCallback(
    async (item: SiteContent, file: File) => {
      try {
        const path = `${item.page}/${item.section_key}/${Date.now()}-${file.name}`;
        const url = await uploadCmsImage(file, path);
        handleSaveField(item, url);
        toast({ title: "Imazhi u ngarkua!" });
      } catch (e: any) {
        toast({ title: "Gabim", description: e.message, variant: "destructive" });
      }
    },
    [handleSaveField, toast]
  );

  const handleToggleVisibility = useCallback(
    (id: string, visible: boolean) => {
      toggleVisibility.mutate({ id, visible });
    },
    [toggleVisibility]
  );

  const handleDragEnd = useCallback(
    (event: any) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !sections) return;

      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = [...sections];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      const updates = reordered.map((s, i) => ({ id: s.id, sort_order: i }));
      updateOrder.mutate(updates);
    },
    [sections, updateOrder]
  );

  // Group sections by page
  const groupedSections = sections?.reduce<Record<string, SiteSection[]>>((acc, s) => {
    if (!acc[s.page]) acc[s.page] = [];
    acc[s.page].push(s);
    return acc;
  }, {}) ?? {};

  const isLoading = loadingContent || loadingSections;

  return (
    <div className="min-h-screen bg-warm-gray">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <h1 className="text-sm tracking-wide-brand font-light uppercase">EGJEU Admin</h1>
            <span className="text-[10px] text-primary-foreground/60">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <div className="flex items-center gap-1 bg-primary-foreground/10 rounded px-2 py-1">
              <Globe size={14} />
              <button
                onClick={() => setLang("al")}
                className={`text-[10px] tracking-brand px-1.5 py-0.5 rounded ${lang === "al" ? "bg-primary-foreground text-primary" : "text-primary-foreground/70"}`}
              >
                AL
              </button>
              <button
                onClick={() => setLang("en")}
                className={`text-[10px] tracking-brand px-1.5 py-0.5 rounded ${lang === "en" ? "bg-primary-foreground text-primary" : "text-primary-foreground/70"}`}
              >
                EN
              </button>
            </div>
            {/* Preview link */}
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary-foreground/80 hover:text-primary-foreground">
              <ExternalLink size={14} /> Preview
            </a>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground hover:bg-primary-foreground/10">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-sm text-muted-foreground tracking-brand">Duke ngarkuar përmbajtjen...</p>
          </div>
        ) : !sections?.length ? (
          <div className="text-center py-20">
            <p className="text-sm text-muted-foreground tracking-brand mb-4">
              Nuk ka përmbajtje të konfiguruar ende.
            </p>
            <p className="text-xs text-muted-foreground">
              Duhet të inicializosh përmbajtjen duke klikuar butonin "Seed Content" më poshtë.
            </p>
          </div>
        ) : (
          Object.entries(groupedSections).map(([page, pageSections]) => (
            <div key={page} className="mb-8">
              <h2 className="text-xs tracking-wide-brand text-muted-foreground uppercase mb-3 pl-1">
                {page === "home" ? "Faqja Kryesore" : page === "company" ? "Rreth Nesh" : page}
              </h2>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={pageSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  {pageSections.map((section) => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      content={content || []}
                      lang={lang}
                      onToggleVisibility={handleToggleVisibility}
                      onSaveField={handleSaveField}
                      onUploadImage={handleUploadImage}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          ))
        )}
      </main>

      {/* Floating preview */}
      {previewOpen && (
        <div className="fixed inset-0 z-[100] bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-background rounded w-full max-w-5xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <span className="text-xs tracking-brand text-muted-foreground uppercase">Live Preview</span>
              <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(false)}>✕</Button>
            </div>
            <iframe src="/" className="flex-1 w-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
