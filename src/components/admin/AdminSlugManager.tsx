import { useState } from "react";
import { usePageSlugs, useUpdatePageSlug } from "@/hooks/usePageSlugs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AdminSlugManager = () => {
  const { data: slugs, isLoading } = usePageSlugs();
  const updateSlug = useUpdatePageSlug();
  const { toast } = useToast();
  const [edits, setEdits] = useState<Record<string, { slug_al: string; slug_en: string }>>({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getEdit = (id: string, field: "slug_al" | "slug_en", original: string) => {
    return edits[id]?.[field] ?? original;
  };

  const setEdit = (id: string, field: "slug_al" | "slug_en", value: string, original_al: string, original_en: string) => {
    setEdits((prev) => ({
      ...prev,
      [id]: {
        slug_al: prev[id]?.slug_al ?? original_al,
        slug_en: prev[id]?.slug_en ?? original_en,
        [field]: value,
      },
    }));
  };

  const isDirty = (id: string, original_al: string, original_en: string) => {
    if (!edits[id]) return false;
    return edits[id].slug_al !== original_al || edits[id].slug_en !== original_en;
  };

  const handleSave = (id: string) => {
    const edit = edits[id];
    if (!edit) return;
    
    // Sanitize slugs
    const sanitized_al = edit.slug_al.toLowerCase().replace(/[^a-z0-9\-]/g, "").replace(/^-+|-+$/g, "");
    const sanitized_en = edit.slug_en.toLowerCase().replace(/[^a-z0-9\-]/g, "").replace(/^-+|-+$/g, "");

    if (!sanitized_al || !sanitized_en) {
      toast({ title: "Gabim", description: "Slugs nuk mund të jenë bosh.", variant: "destructive" });
      return;
    }

    updateSlug.mutate(
      { id, slug_al: sanitized_al, slug_en: sanitized_en },
      {
        onSuccess: () => {
          toast({ title: "U ruajt!", description: "Slug u përditësua." });
          setEdits((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        },
        onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div>
      <h2 className="text-lg tracking-wide-brand text-foreground font-light mb-2 uppercase">
        Menaxhimi i Slug-eve
      </h2>
      <p className="text-xs text-muted-foreground mb-6">
        Ndryshoni URL slugs për secilën faqe. Slugs duhet të përmbajnë vetëm shkronja, numra dhe viza.
      </p>

      <div className="space-y-3">
        <div className="grid grid-cols-[140px_1fr_1fr_60px] gap-3 text-[10px] tracking-brand text-muted-foreground uppercase px-1">
          <span>Faqja</span>
          <span>Slug (AL)</span>
          <span>Slug (EN)</span>
          <span></span>
        </div>

        {slugs?.map((slug) => (
          <div key={slug.id} className="grid grid-cols-[140px_1fr_1fr_60px] gap-3 items-center bg-background border border-border rounded-md px-3 py-2">
            <div className="flex items-center gap-2">
              <LinkIcon size={14} className="text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">{slug.page_key}</span>
            </div>
            <Input
              value={getEdit(slug.id, "slug_al", slug.slug_al)}
              onChange={(e) => setEdit(slug.id, "slug_al", e.target.value, slug.slug_al, slug.slug_en)}
              className="text-xs h-8"
              placeholder="slug-shqip"
            />
            <Input
              value={getEdit(slug.id, "slug_en", slug.slug_en)}
              onChange={(e) => setEdit(slug.id, "slug_en", e.target.value, slug.slug_al, slug.slug_en)}
              className="text-xs h-8"
              placeholder="english-slug"
            />
            <div>
              {isDirty(slug.id, slug.slug_al, slug.slug_en) && (
                <Button size="sm" className="h-8 w-8 p-0" onClick={() => handleSave(slug.id)}>
                  <Save size={14} />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
