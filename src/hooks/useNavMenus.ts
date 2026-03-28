import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NavMenuItem {
  id: string;
  location: string;
  label: string;
  label_en: string;
  href: string;
  sort_order: number;
  visible: boolean;
}

export const useNavMenusByLocation = (location: string) => {
  return useQuery({
    queryKey: ["nav_menus", location],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nav_menus")
        .select("*")
        .eq("location", location)
        .eq("visible", true)
        .order("sort_order");
      if (error) throw error;
      return data as NavMenuItem[];
    },
  });
};
