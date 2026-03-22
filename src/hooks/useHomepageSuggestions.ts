import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SuggestedProduct {
  id: string;
  product_id: string;
  sort_order: number;
}

export const useHomepageSuggestions = () =>
  useQuery({
    queryKey: ["homepage_suggested_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_suggested_products" as any)
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as unknown as SuggestedProduct[];
    },
  });

export const useSuggestedProductsFull = () =>
  useQuery({
    queryKey: ["homepage_suggested_products_full"],
    queryFn: async () => {
      const { data: suggestions, error: sErr } = await supabase
        .from("homepage_suggested_products" as any)
        .select("*")
        .order("sort_order");
      if (sErr) throw sErr;
      const ids = (suggestions as any[]).map((s: any) => s.product_id);
      if (!ids.length) return [];
      const { data: products, error: pErr } = await supabase
        .from("products")
        .select("*")
        .in("id", ids)
        .eq("visible", true);
      if (pErr) throw pErr;
      // Sort by suggestion order
      const orderMap = new Map((suggestions as any[]).map((s: any) => [s.product_id, s.sort_order]));
      return (products ?? []).sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
    },
  });

export const useSetSuggestedProducts = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productIds: string[]) => {
      // Delete all, then insert new
      await supabase.from("homepage_suggested_products" as any).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (productIds.length) {
        const rows = productIds.map((pid, i) => ({ product_id: pid, sort_order: i }));
        const { error } = await supabase.from("homepage_suggested_products" as any).insert(rows);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homepage_suggested_products"] });
      qc.invalidateQueries({ queryKey: ["homepage_suggested_products_full"] });
    },
  });
};
