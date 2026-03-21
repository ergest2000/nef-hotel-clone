import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Collection = Tables<"collections">;
type Product = Tables<"products">;
type ProductImage = Tables<"product_images">;

// Collections
export const useCollections = () =>
  useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Collection[];
    },
  });

export const useUpsertCollection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<Collection> & { slug: string }) => {
      const { data, error } = await supabase
        .from("collections")
        .upsert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });
};

export const useDeleteCollection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });
};

export const useUpdateCollectionOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; sort_order: number }[]) => {
      await Promise.all(
        items.map((i) =>
          supabase.from("collections").update({ sort_order: i.sort_order }).eq("id", i.id)
        )
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });
};

// Products
export const useProducts = (collectionId?: string) =>
  useQuery({
    queryKey: ["products", collectionId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("products").select("*").order("sort_order");
      if (collectionId) q = q.eq("collection_id", collectionId);
      const { data, error } = await q;
      if (error) throw error;
      return data as Product[];
    },
  });

export const useUpsertProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<Product> & { collection_id: string }) => {
      const { data, error } = await supabase
        .from("products")
        .upsert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useUpdateProductOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; sort_order: number }[]) => {
      await Promise.all(
        items.map((i) =>
          supabase.from("products").update({ sort_order: i.sort_order }).eq("id", i.id)
        )
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
};

// Product Images
export const useProductImages = (productId?: string) =>
  useQuery({
    queryKey: ["product_images", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId!)
        .order("sort_order");
      if (error) throw error;
      return data as ProductImage[];
    },
  });
