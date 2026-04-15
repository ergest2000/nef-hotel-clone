import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;
type SiteSection = Tables<"site_sections">;

const CONTENT_STALE = 5 * 60 * 1000;  // 5 minuta
const SECTION_STALE = 10 * 60 * 1000; // 10 minuta

export const usePageContent = (page: string, lang: string = "al") => {
  return useQuery({
    queryKey: ["site_content", page, lang],
    staleTime: CONTENT_STALE,
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

export const useAllContent = (lang?: string) => {
  return useQuery({
    queryKey: ["site_content", "all", lang ?? "all"],
    staleTime: CONTENT_STALE,
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

export const usePageSections = (page: string) => {
  return useQuery({
    queryKey: ["site_sections", page],
    staleTime: SECTION_STALE,
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

export const useAllSections = () => {
  return useQuery({
    queryKey: ["site_sections", "all"],
    staleTime: SECTION_STALE,
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

const convertToWebP = (file: File, quality = 0.85): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context unavailable"));
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("WebP conversion failed"))),
        "image/webp",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Image load failed")); };
    img.src = objectUrl;
  });

export const uploadCmsImage = async (file: File, path: string) => {
  const webpPath = path.replace(/\.[^.]+$/, "") + ".webp";
  const blob = await convertToWebP(file);
  const webpFile = new File([blob], webpPath.split("/").pop()!, { type: "image/webp" });

  const { data, error } = await supabase.storage
    .from("cms-images")
    .upload(webpPath, webpFile, { upsert: true, contentType: "image/webp" });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("cms-images").getPublicUrl(data.path);
  return urlData.publicUrl;
};

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
