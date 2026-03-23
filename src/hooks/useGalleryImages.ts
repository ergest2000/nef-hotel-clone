import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GalleryImage {
  id: string;
  gallery_key: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  visible: boolean;
}

export const useGalleryImages = (galleryKey: string) =>
  useQuery({
    queryKey: ["gallery_images", galleryKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images" as any)
        .select("*")
        .eq("gallery_key", galleryKey)
        .eq("visible", true)
        .order("sort_order");
      if (error) throw error;
      return data as unknown as GalleryImage[];
    },
  });

export const useAllGalleryImages = (galleryKey: string) =>
  useQuery({
    queryKey: ["gallery_images_all", galleryKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images" as any)
        .select("*")
        .eq("gallery_key", galleryKey)
        .order("sort_order");
      if (error) throw error;
      return data as unknown as GalleryImage[];
    },
  });

export const useUpsertGalleryImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (img: Partial<GalleryImage> & { gallery_key: string }) => {
      if (img.id) {
        const { error } = await supabase.from("gallery_images" as any).update(img).eq("id", img.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gallery_images" as any).insert(img);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery_images"] });
      qc.invalidateQueries({ queryKey: ["gallery_images_all"] });
    },
  });
};

export const useDeleteGalleryImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_images" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery_images"] });
      qc.invalidateQueries({ queryKey: ["gallery_images_all"] });
    },
  });
};
