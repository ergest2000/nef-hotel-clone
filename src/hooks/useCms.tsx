import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;
type SiteSection = Tables<"site_sections">;

// Fetch all content for a page & language
export const usePageContent = (page: string, lang: string = "al") => {
  return useQuery({
    queryKey: ["site_content", page, lang],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("page", page)
        .eq("lang", lang)
        .order("sort_order");
      if (error) throw error;
      return data as SiteContent[];
    },
  });
};

// Fetch all content for all pages (admin dashboard) - optionally filter by lang
export const useAllContent = (lang?: string) => {
  return useQuery({
    queryKey: ["site_content", "all", lang ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("site_content")
        .select("*")
        .order("page")
        .order("section_key")
        .order("sort_order");
      if (lang) {
        query = query.eq("lang", lang);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as SiteContent[];
    },
  });
};

// Fetch sections for a page
export const usePageSections = (page: string) => {
  return useQuery({
    queryKey: ["site_sections", page],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_sections")
        .select("*")
        .eq("page", page)
        .order("sort_order");
      if (error) throw error;
      return data as SiteSection[];
    },
  });
};

// All sections (admin)
export const useAllSections = () => {
  return useQuery({
    queryKey: ["site_sections", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_sections")
        .select("*")
        .order("page")
        .order("sort_order");
      if (error) throw error;
      return data as SiteSection[];
    },
  });
};

// Upsert content
export const useUpsertContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<SiteContent> & { page: string; section_key: string; field_key: string; lang: string }) => {
      const { data, error } = await supabase
        .from("site_content")
        .upsert(item, { onConflict: "page,section_key,field_key,lang" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site_content"] });
    },
  });
};

// Update section order
export const useUpdateSectionOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sections: { id: string; sort_order: number }[]) => {
      const promises = sections.map((s) =>
        supabase.from("site_sections").update({ sort_order: s.sort_order }).eq("id", s.id)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site_sections"] });
    },
  });
};

// Toggle section visibility
export const useToggleSectionVisibility = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const { error } = await supabase
        .from("site_sections")
        .update({ visible })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site_sections"] });
    },
  });
};

// Upload image to cms-images bucket
export const uploadCmsImage = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from("cms-images")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("cms-images").getPublicUrl(data.path);
  return urlData.publicUrl;
};

// Helper: get content value by section + field
export const getContentValue = (
  content: SiteContent[] | undefined,
  sectionKey: string,
  fieldKey: string,
  fallback: string = ""
): string => {
  if (!content) return fallback;
  const item = content.find(
    (c) => c.section_key === sectionKey && c.field_key === fieldKey
  );
  return item?.value ?? fallback;
};
