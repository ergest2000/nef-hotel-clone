import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HomepageCategory {
  id: string;
  title_al: string;
  title_en: string;
  image_url: string;
  link_url: string;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export const useHomepageCategories = (onlyVisible = false) =>
  useQuery({
    queryKey: ["homepage_categories", onlyVisible],
    queryFn: async () => {
      let q = supabase.from("homepage_categories" as any).select("*").order("sort_order");
      if (onlyVisible) q = q.eq("visible", true);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as HomepageCategory[];
    },
  });

export const useUpsertHomepageCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<HomepageCategory>) => {
      const { data, error } = await supabase
        .from("homepage_categories" as any)
        .upsert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["homepage_categories"] }),
  });
};

export const useDeleteHomepageCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("homepage_categories" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["homepage_categories"] }),
  });
};
