import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StaticPage {
  id: string;
  page_key: string;
  title_al: string;
  title_en: string;
  content_al: string;
  content_en: string;
  created_at: string;
  updated_at: string;
}

export const useStaticPages = () =>
  useQuery({
    queryKey: ["static_pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("static_pages" as any)
        .select("*")
        .order("page_key");
      if (error) throw error;
      return data as unknown as StaticPage[];
    },
  });

export const useStaticPage = (pageKey: string) =>
  useQuery({
    queryKey: ["static_pages", pageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("static_pages" as any)
        .select("*")
        .eq("page_key", pageKey)
        .single();
      if (error) throw error;
      return data as unknown as StaticPage;
    },
  });

export const useUpsertStaticPage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<StaticPage> & { page_key: string }) => {
      const { data, error } = await supabase
        .from("static_pages" as any)
        .upsert(item, { onConflict: "page_key" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["static_pages"] }),
  });
};
