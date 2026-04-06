// ─── SHTO KËTO NË FUND TË useCollections.ts ──────────────────────────────────

// Product ↔ Collections (many-to-many)
export interface ProductCollection {
  id: string;
  product_id: string;
  collection_id: string;
  sort_order: number;
  created_at: string;
}

export const useProductCollections = (productId?: string) =>
  useQuery({
    queryKey: ["product_collections", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_collections" as any)
        .select("*")
        .eq("product_id", productId!)
        .order("sort_order");
      if (error) throw error;
      return data as unknown as ProductCollection[];
    },
  });

export const useAddProductCollection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ product_id, collection_id }: { product_id: string; collection_id: string }) => {
      const { error } = await supabase
        .from("product_collections" as any)
        .insert({ product_id, collection_id });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["product_collections", vars.product_id] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useRemoveProductCollection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ product_id, collection_id }: { product_id: string; collection_id: string }) => {
      const { error } = await supabase
        .from("product_collections" as any)
        .delete()
        .eq("product_id", product_id)
        .eq("collection_id", collection_id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["product_collections", vars.product_id] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
