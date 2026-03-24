import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  slug: string;
  title_al: string;
  title_en: string;
  excerpt_al: string;
  excerpt_en: string;
  content_al: string;
  content_en: string;
  image: string;
  author: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useBlogPosts = () => {
  return useQuery({
    queryKey: ["blog_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as BlogPost[];
    },
  });
};

export const usePublishedBlogPosts = () => {
  return useQuery({
    queryKey: ["blog_posts", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("sort_order");
      if (error) throw error;
      return data as BlogPost[];
    },
  });
};

export const useBlogPostBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["blog_posts", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });
};

export const useUpsertBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: Partial<BlogPost> & { slug: string }) => {
      // Ensure slug uniqueness: check for existing posts with same slug (excluding current post)
      let finalSlug = post.slug;
      const { data: existing } = await supabase
        .from("blog_posts")
        .select("id, slug")
        .eq("slug", finalSlug);
      
      const isDuplicate = existing?.some((e) => e.id !== post.id && e.slug === finalSlug);
      if (isDuplicate) {
        // Append suffix to make unique
        let suffix = 1;
        let candidate = `${finalSlug}-${suffix}`;
        while (true) {
          const { data: check } = await supabase
            .from("blog_posts")
            .select("id")
            .eq("slug", candidate);
          if (!check?.length || check.every((c) => c.id === post.id)) break;
          suffix++;
          candidate = `${finalSlug}-${suffix}`;
        }
        finalSlug = candidate;
      }

      const { data, error } = await supabase
        .from("blog_posts")
        .upsert({ ...post, slug: finalSlug }, { onConflict: "slug" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog_posts"] });
    },
  });
};

export const useDeleteBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog_posts"] });
    },
  });
};
