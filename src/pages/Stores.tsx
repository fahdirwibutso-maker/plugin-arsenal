import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreCard from "@/components/StoreCard";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useCartCount } from "@/hooks/useCartCount";
import { useWholesaleStatus } from "@/hooks/useWholesaleStatus";
import { useStores } from "@/hooks/useStores";

export const useStoreProductCounts = () =>
  useQuery({
    queryKey: ["store-product-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("store_id").eq("is_active", true);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data as any[]).forEach((p) => { if (p.store_id) counts[p.store_id] = (counts[p.store_id] || 0) + 1; });
      return counts;
    },
  });

const Stores = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { count: cartItemCount } = useCartCount();
  const { isWholesale } = useWholesaleStatus();
  const { data: stores = [], isLoading } = useStores();
  const { data: counts = {} } = useStoreProductCounts();

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return q ? stores.filter((s) => s.name.toLowerCase().includes(q) || (s.location || "").toLowerCase().includes(q)) : stores;
  }, [stores, searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Helmet>
        <title>Our Stores & Locations — WellarShop</title>
        <meta name="description" content="Find WellarShop stores near you. Browse each store's products, location, phone and opening hours." />
      </Helmet>
      <Header cartItemCount={cartItemCount} isWholesale={isWholesale} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="container px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-1">Our Stores</h1>
        <p className="text-sm text-muted-foreground mb-6">Pick a store to see its products, or search by name or location.</p>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No stores found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((s) => <StoreCard key={s.id} store={s} productCount={counts[s.id] || 0} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Stores;
