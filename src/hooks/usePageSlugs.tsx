import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PageSlug {
  id: string;
  page_key: string;
  slug_al: string;
  slug_en: string;
  created_at: string;
  updated_at: string;
}

export const usePageSlugs = () => {
  return useQuery({
    queryKey: ["page_slugs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_slugs")
        .select("*")
        .order("page_key");
      if (error) throw error;
      return data as PageSlug[];
    },
  });
};

export const useUpdatePageSlug = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, slug_al, slug_en }: { id: string; slug_al: string; slug_en: string }) => {
      const { error } = await supabase
        .from("page_slugs")
        .update({ slug_al, slug_en })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["page_slugs"] });
    },
  });
};

/** Given a URL path segment, find which page_key it maps to */
export const resolveSlug = (slugs: PageSlug[] | undefined, segment: string): string | null => {
  if (!slugs) return null;
  const match = slugs.find(
    (s) => s.slug_al === segment || s.slug_en === segment
  );
  return match?.page_key ?? null;
};

/** Get the correct slug for a page_key based on current language */
export const getSlugForPage = (slugs: PageSlug[] | undefined, pageKey: string, lang: "al" | "en"): string => {
  if (!slugs) return pageKey;
  const match = slugs.find((s) => s.page_key === pageKey);
  if (!match) return pageKey;
  return lang === "al" ? match.slug_al : match.slug_en;
};
