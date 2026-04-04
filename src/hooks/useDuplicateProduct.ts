import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDuplicateProduct = () => {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productId: string) => {
      // 1. Merr produktin origjinal
      const { data: original, error: e1 } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();
      if (e1) throw e1;

      // 2. Krijo produktin e ri (draft, jo visible, me suffix "(Copy)")
      const { id: _id, created_at: _ca, updated_at: _ua, slug: _slug, ...rest } = original as any;
      const newProduct = {
        ...rest,
        title_al: `${original.title_al} (Kopje)`,
        title_en: `${original.title_en} (Copy)`,
        visible: false,
        slug: null, // do gjenerohet automatikisht nga DB trigger
      };

      const { data: created, error: e2 } = await supabase
        .from("products")
        .insert(newProduct)
        .select()
        .single();
      if (e2) throw e2;

      const newId = (created as any).id;

      // 3. Kopjo colors
      const { data: colors } = await supabase
        .from("product_colors" as any)
        .select("*")
        .eq("product_id", productId);

      if (colors && colors.length > 0) {
        const newColors = (colors as any[]).map(({ id: _id, created_at: _ca, ...c }: any) => ({
          ...c,
          product_id: newId,
        }));
        await supabase.from("product_colors" as any).insert(newColors);
      }

      // 4. Kopjo sizes
      const { data: sizes } = await supabase
        .from("product_sizes" as any)
        .select("*")
        .eq("product_id", productId);

      if (sizes && sizes.length > 0) {
        const newSizes = (sizes as any[]).map(({ id: _id, created_at: _ca, ...s }: any) => ({
          ...s,
          product_id: newId,
        }));
        await supabase.from("product_sizes" as any).insert(newSizes);
      }

      // 5. Kopjo images
      const { data: images } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order");

      if (images && images.length > 0) {
        const newImages = images.map(({ id: _id, created_at: _ca, ...img }: any) => ({
          ...img,
          product_id: newId,
        }));
        await supabase.from("product_images").insert(newImages);
      }

      return created;
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["products-search"] });
      toast({
        title: "Produkti u duplikua!",
        description: `"${(created as any).title_al}" u krijua si draft.`,
      });
    },
    onError: (e: any) => {
      toast({
        title: "Gabim gjatë duplikimit",
        description: e.message,
        variant: "destructive",
      });
    },
  });
};
