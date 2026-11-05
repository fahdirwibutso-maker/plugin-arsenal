import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mergeSettings, defaultSettings } from "@/lib/siteSettings";

export const useSiteSettings = () => {
  const q = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("data").eq("id", "main").maybeSingle();
      if (error) throw error;
      return mergeSettings(data?.data);
    },
    staleTime: 1000 * 60 * 5,
  });
  return { ...q, settings: q.data ?? defaultSettings };
};
