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
      let finalSlug = post.slug;

      // Check slug uniqueness
      const { data: existing } = await supabase
        .from("blog_posts")
        .select("id, slug")
        .eq("slug", finalSlug);

      const isDuplicate = existing?.some((e) => e.id !== post.id && e.slug === finalSlug);
      if (isDuplicate) {
        finalSlug = finalSlug + "-" + Date.now().toString(36).slice(-5);
      }

      let data, error;
      if (post.id) {
        // UPDATE existing post
        const { id, ...updates } = post;
        const result = await supabase
          .from("blog_posts")
          .update({ ...updates, slug: finalSlug })
          .eq("id", id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // INSERT new post
        const result = await supabase
          .from("blog_posts")
          .insert({ ...post, slug: finalSlug })
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

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
