import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Upload, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadCmsImage } from "@/hooks/useCms";
import { useRef } from "react";

interface SeoData {
  id?: string;
  page: string;
  lang: string;
  meta_title: string;
  meta_description: string;
  seo_keywords: string;
  og_image: string;
}

export const usePageSeo = (page: string) => {
  return useQuery({
    queryKey: ["seo_metadata", page],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_metadata")
        .select("*")
        .eq("page", page);
      if (error) throw error;
      return data as SeoData[];
    },
  });
};

export const AdminSeoEditor = ({ page }: { page: string }) => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: seoData } = usePageSeo(page);
  const fileRef = useRef<HTMLInputElement>(null);

  const [al, setAl] = useState<SeoData>({ page, lang: "al", meta_title: "", meta_description: "", seo_keywords: "", og_image: "" });
  const [en, setEn] = useState<SeoData>({ page, lang: "en", meta_title: "", meta_description: "", seo_keywords: "", og_image: "" });

  useEffect(() => {
    if (seoData) {
      const alData = seoData.find(s => s.lang === "al");
      const enData = seoData.find(s => s.lang === "en");
      if (alData) setAl(alData);
      if (enData) setEn(enData);
    }
  }, [seoData]);

  const saveMutation = useMutation({
    mutationFn: async (item: SeoData) => {
      const { error } = await supabase
        .from("seo_metadata")
        .upsert(item, { onConflict: "page,lang" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seo_metadata"] });
      toast({ title: "SEO u ruajt!" });
    },
    onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
  });

  const handleSave = () => {
    saveMutation.mutate(al);
    saveMutation.mutate(en);
  };

  const handleOgUpload = async (file: File) => {
    try {
      const path = `seo/${page}/${Date.now()}-${file.name}`;
      const url = await uploadCmsImage(file, path);
      setAl(prev => ({ ...prev, og_image: url }));
      setEn(prev => ({ ...prev, og_image: url }));
    } catch (e: any) {
      toast({ title: "Gabim", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="border border-border rounded-md bg-background p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Globe size={16} className="text-primary" />
        <h3 className="text-xs tracking-brand uppercase font-medium text-foreground">SEO Settings</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AL */}
        <div className="space-y-3">
          <span className="text-[9px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">AL</span>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase tracking-brand">Meta Title</label>
            <Input value={al.meta_title} onChange={e => setAl(p => ({ ...p, meta_title: e.target.value }))} className="text-xs h-9" placeholder="Titulli i faqes" />
            <p className="text-[9px] text-muted-foreground">{al.meta_title.length}/60 karaktere</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase tracking-brand">Meta Description</label>
            <Textarea value={al.meta_description} onChange={e => setAl(p => ({ ...p, meta_description: e.target.value }))} className="text-xs min-h-[60px]" placeholder="Përshkrimi i faqes" />
            <p className="text-[9px] text-muted-foreground">{al.meta_description.length}/160 karaktere</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase tracking-brand">SEO Keywords</label>
            <Input value={al.seo_keywords} onChange={e => setAl(p => ({ ...p, seo_keywords: e.target.value }))} className="text-xs h-9" placeholder="keyword1, keyword2" />
          </div>
        </div>

        {/* EN */}
        <div className="space-y-3">
          <span className="text-[9px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">EN</span>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase tracking-brand">Meta Title</label>
            <Input value={en.meta_title} onChange={e => setEn(p => ({ ...p, meta_title: e.target.value }))} className="text-xs h-9" placeholder="Page title" />
            <p className="text-[9px] text-muted-foreground">{en.meta_title.length}/60 characters</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase tracking-brand">Meta Description</label>
            <Textarea value={en.meta_description} onChange={e => setEn(p => ({ ...p, meta_description: e.target.value }))} className="text-xs min-h-[60px]" placeholder="Page description" />
            <p className="text-[9px] text-muted-foreground">{en.meta_description.length}/160 characters</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase tracking-brand">SEO Keywords</label>
            <Input value={en.seo_keywords} onChange={e => setEn(p => ({ ...p, seo_keywords: e.target.value }))} className="text-xs h-9" placeholder="keyword1, keyword2" />
          </div>
        </div>
      </div>

      {/* OG Image */}
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground uppercase tracking-brand">OG Image (Social Preview)</label>
        <div className="flex items-center gap-3">
          {al.og_image && <img src={al.og_image} alt="" className="w-24 h-14 object-cover border border-border rounded" />}
          <Input value={al.og_image} onChange={e => { setAl(p => ({ ...p, og_image: e.target.value })); setEn(p => ({ ...p, og_image: e.target.value })); }} className="text-xs h-9 flex-1" placeholder="URL e imazhit" />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleOgUpload(f); }} />
          <Button variant="outline" size="sm" className="h-9" onClick={() => fileRef.current?.click()}>
            <Upload size={14} />
          </Button>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button size="sm" onClick={handleSave} className="text-xs">
          <Save size={14} className="mr-1" /> Ruaj SEO
        </Button>
      </div>
    </div>
  );
};
