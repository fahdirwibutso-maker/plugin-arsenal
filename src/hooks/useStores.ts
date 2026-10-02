import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  location: string | null;
  map_url: string | null;
  phone: string | null;
  opening_hours: string | null;
  owner_id: string | null;
  is_active: boolean;
}

export const useStores = () =>
  useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores" as any)
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return (data || []) as unknown as Store[];
    },
    staleTime: 1000 * 60,
  });

export const useMyStores = () =>
  useQuery({
    queryKey: ["my-stores"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [] as Store[];
      const { data, error } = await supabase
        .from("stores" as any)
        .select("*")
        .eq("owner_id", user.id)
        .order("name");
      if (error) throw error;
      return (data || []) as unknown as Store[];
    },
  });

export const mapLink = (s: Pick<Store, "map_url" | "location" | "name">) =>
  s.map_url || (s.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name} ${s.location}`)}` : null);
