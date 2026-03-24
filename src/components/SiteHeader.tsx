import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserOffer {
  id: string;
  user_id: string;
  product_id: string | null;
  title_al: string;
  title_en: string;
  description_al: string;
  description_en: string;
  discount_percent: number;
  valid_until: string | null;
  seen: boolean;
  created_at: string;
}

export const useUserOffers = (userId?: string) =>
  useQuery({
    queryKey: ["user_offers", userId],
    enabled: !!userId,
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("user_offers")
          .select("*")
          .eq("user_id", userId!)
          .order("created_at", { ascending: false });
        if (error) return [];
        return (data ?? []) as UserOffer[];
      } catch {
        return [];
      }
    },
  });

export const useSearchHistory = (userId?: string) =>
  useQuery({
    queryKey: ["search_history", userId],
    enabled: !!userId,
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("user_search_history")
          .select("*")
          .eq("user_id", userId!)
          .order("created_at", { ascending: false })
          .limit(20);
        if (error) return [];
        return (data ?? []) as { id: string; search_query: string; product_id: string | null; created_at: string }[];
      } catch {
        return [];
      }
    },
  });

export const saveSearchHistory = async (userId: string, query: string, productId?: string) => {
  if (!query.trim() || query.length < 2) return;
  try {
    await (supabase as any).from("user_search_history").insert({
      user_id: userId,
      search_query: query.trim(),
      product_id: productId || null,
    });
  } catch {}
};
