import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProductSearch = (query: string) => {
  const trimmed = query.trim().toLowerCase();

  const { data: products } = useQuery({
    queryKey: ["products-search"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, title_al, title_en, code, image_url, collection_id, composition_al, composition_en, slug")
        .eq("visible", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    staleTime: 60000,
  });

  const { data: collections } = useQuery({
    queryKey: ["collections-search"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("id, slug, title_al, title_en")
        .eq("visible", true);
      if (error) throw error;
      return data;
    },
    staleTime: 60000,
  });

  const collectionMap = useMemo(() => {
    const map = new Map<string, { slug: string; title_al: string; title_en: string }>();
    collections?.forEach((c) => map.set(c.id, c));
    return map;
  }, [collections]);

  const results = useMemo(() => {
    if (!trimmed || trimmed.length < 2 || !products) return [];
    return products
      .filter((p) => {
        const searchIn = `${p.title_al} ${p.title_en} ${p.code || ""} ${p.composition_al || ""} ${p.composition_en || ""}`.toLowerCase();
        return searchIn.includes(trimmed);
      })
      .slice(0, 8)
      .map((p) => {
        const col = collectionMap.get(p.collection_id);
        return {
          ...p,
          collectionSlug: col?.slug ?? "",
          collectionTitle_al: col?.title_al ?? "",
          collectionTitle_en: col?.title_en ?? "",
        };
      });
  }, [trimmed, products, collectionMap]);

  return { results, hasQuery: trimmed.length >= 2 };
};
