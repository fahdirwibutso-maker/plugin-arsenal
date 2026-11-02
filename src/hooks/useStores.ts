import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerSession } from "@/hooks/useOwnerSession";

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

export const useMyStores = () => {
  const session = useOwnerSession();
  const query = useQuery({
    queryKey: ["my-stores", session.user?.id],
    enabled: !!session.user && !session.loading,
    queryFn: async () => {
      const user = session.user;
      if (!user) return [] as Store[];
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", user.id)
        .order("name");
      if (error) throw error;
      return (data || []) as unknown as Store[];
    },
  });
  return { ...query, user: session.user, authError: session.error, isLoading: session.loading || (!!session.user && query.isLoading) };
};

export const mapLink = (s: Pick<Store, "map_url" | "location" | "name">) =>
  s.map_url || (s.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name} ${s.location}`)}` : null);
