import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StaticPage {
  id: string;
  page_key: string;
  title_al: string;
  title_en: string;
  content_al: string;
  content_en: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export var useStaticPages = function () {
  return useQuery({
    queryKey: ["static_pages"],
    queryFn: async function () {
      var result = await supabase
        .from("static_pages" as any)
        .select("*")
        .order("page_key");
      if (result.error) throw result.error;
      return result.data as unknown as StaticPage[];
    },
  });
};

export var useStaticPage = function (pageKey: string) {
  return useQuery({
    queryKey: ["static_pages", pageKey],
    queryFn: async function () {
      var result = await supabase
        .from("static_pages" as any)
        .select("*")
        .eq("page_key", pageKey)
        .single();
      if (result.error) throw result.error;
      return result.data as unknown as StaticPage;
    },
  });
};

export var useUpsertStaticPage = function () {
  var qc = useQueryClient();
  return useMutation({
    mutationFn: async function (item: Partial<StaticPage> & { page_key: string }) {
      var result = await supabase
        .from("static_pages" as any)
        .upsert(item, { onConflict: "page_key" })
        .select()
        .single();
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: function () { qc.invalidateQueries({ queryKey: ["static_pages"] }); },
  });
};
