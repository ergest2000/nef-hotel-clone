import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ManagedLogo {
  id: string;
  category: string;
  name: string;
  logo_url: string | null;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export const useManagedLogos = (category: string) => {
  return useQuery({
    queryKey: ["managed_logos", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managed_logos")
        .select("*")
        .eq("category", category)
        .order("sort_order");
      if (error) throw error;
      return data as ManagedLogo[];
    },
  });
};

export const useUpsertLogo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (logo: Partial<ManagedLogo> & { category: string; name: string }) => {
      const { data, error } = await supabase
        .from("managed_logos")
        .upsert(logo)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["managed_logos"] }),
  });
};

export const useDeleteLogo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("managed_logos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["managed_logos"] }),
  });
};

export const useReorderLogos = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      await Promise.all(
        updates.map((u) =>
          supabase.from("managed_logos").update({ sort_order: u.sort_order }).eq("id", u.id)
        )
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["managed_logos"] }),
  });
};
