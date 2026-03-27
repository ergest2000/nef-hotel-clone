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

export const useAddProductImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: { product_id: string; image_url: string; sort_order: number }) => {
      const { data, error } = await supabase
        .from("product_images")
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["product_images", vars.product_id] }),
  });
};

export const useDeleteProductImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, product_id }: { id: string; product_id: string }) => {
      const { error } = await supabase.from("product_images").delete().eq("id", id);
      if (error) throw error;
      return product_id;
    },
    onSuccess: (product_id) => qc.invalidateQueries({ queryKey: ["product_images", product_id] }),
  });
};

// Product Colors
export interface ProductColor {
  id: string;
  product_id: string;
  color_name: string;
  color_name_al: string;
  color_name_en: string;
  color_hex: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

// Wishlists
export const useWishlist = (userId?: string) =>
  useQuery({
    queryKey: ["wishlists", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlists" as any)
        .select("*")
        .eq("user_id", userId!);
      if (error) throw error;
      return data as unknown as { id: string; user_id: string; product_id: string; created_at: string }[];
    },
  });

export const useToggleWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, productId, isWishlisted }: { userId: string; productId: string; isWishlisted: boolean }) => {
      if (isWishlisted) {
        const { error } = await supabase.from("wishlists" as any).delete().eq("user_id", userId).eq("product_id", productId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("wishlists" as any).insert({ user_id: userId, product_id: productId });
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["wishlists", vars.userId] }),
  });
};

export const useProductColors = (productId?: string) =>
  useQuery({
    queryKey: ["product_colors", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_colors" as any)
        .select("*")
        .eq("product_id", productId!)
        .order("sort_order");
      if (error) throw error;
      return data as unknown as ProductColor[];
    },
  });

export const useAddProductColor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: { product_id: string; color_name: string; color_name_al: string; color_name_en: string; color_hex: string; image_url?: string; sort_order: number }) => {
      const { data, error } = await supabase
        .from("product_colors" as any)
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["product_colors", vars.product_id] }),
  });
};

export const useDeleteProductColor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, product_id }: { id: string; product_id: string }) => {
      const { error } = await supabase.from("product_colors" as any).delete().eq("id", id);
      if (error) throw error;
      return product_id;
    },
    onSuccess: (product_id) => qc.invalidateQueries({ queryKey: ["product_colors", product_id] }),
  });
};

export const useUpdateProductColor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, product_id, updates }: { id: string; product_id: string; updates: Partial<ProductColor> }) => {
      const { error } = await supabase.from("product_colors" as any).update(updates).eq("id", id);
      if (error) throw error;
      return product_id;
    },
    onSuccess: (product_id) => {
      qc.invalidateQueries({ queryKey: ["product_colors", product_id] });
      qc.invalidateQueries({ queryKey: ["all_product_colors"] });
    },
  });
};

// Product Sizes
export interface ProductSize {
  id: string;
  product_id: string;
  size_label: string;
  sort_order: number;
  created_at: string;
}

export const useProductSizes = (productId?: string) =>
  useQuery({
    queryKey: ["product_sizes", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_sizes" as any)
        .select("*")
        .eq("product_id", productId!)
        .order("sort_order");
      if (error) throw error;
      return data as unknown as ProductSize[];
    },
  });

export const useAddProductSize = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: { product_id: string; size_label: string; sort_order: number }) => {
      const { data, error } = await supabase
        .from("product_sizes" as any)
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["product_sizes", vars.product_id] }),
  });
};

export const useDeleteProductSize = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, product_id }: { id: string; product_id: string }) => {
      const { error } = await supabase.from("product_sizes" as any).delete().eq("id", id);
      if (error) throw error;
      return product_id;
    },
    onSuccess: (product_id) => qc.invalidateQueries({ queryKey: ["product_sizes", product_id] }),
  });
};

// All product colors (for filters)
export const useAllProductColors = () =>
  useQuery({
    queryKey: ["all_product_colors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_colors" as any)
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as unknown as ProductColor[];
    },
  });

// All product sizes (for filters)
export const useAllProductSizes = () =>
  useQuery({
    queryKey: ["all_product_sizes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_sizes" as any)
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as unknown as ProductSize[];
    },
  });
