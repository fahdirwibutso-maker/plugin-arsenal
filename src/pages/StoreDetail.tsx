import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Clock, Store as StoreIcon, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useCartCount } from "@/hooks/useCartCount";
import { useWholesaleStatus } from "@/hooks/useWholesaleStatus";
import { mapLink, type Store } from "@/hooks/useStores";

const StoreDetail = () => {
  const { slug } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const { count: cartItemCount } = useCartCount();
  const { isWholesale } = useWholesaleStatus();

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["store", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("stores" as any).select("*").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      return data as unknown as Store | null;
    },
    enabled: !!slug,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["store-products", store?.id],
    queryFn: async () => {
      const q: any = supabase.from("products").select("*").eq("is_active", true);
      const { data, error } = await q.eq("store_id", store!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!store?.id,
  });

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category)))], [products]);
  const filtered = products.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (!searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const map = store ? mapLink(store) : null;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Helmet>
        <title>{store ? `${store.name} — WellarShop` : "Store — WellarShop"}</title>
        <meta name="description" content={store?.description || `Shop products from ${store?.name ?? "our stores"} on WellarShop.`} />
      </Helmet>
      <Header cartItemCount={cartItemCount} isWholesale={isWholesale} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="container px-4 sm:px-6 py-4 sm:py-8">
        <Link to="/stores" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-3 w-3" /> All stores
        </Link>

        {storeLoading ? (
          <Skeleton className="h-32 w-full rounded-xl mb-6" />
        ) : !store ? (
          <p className="text-muted-foreground py-12 text-center">Store not found.</p>
        ) : (
          <section className="futuristic-card p-4 sm:p-6 mb-6 flex flex-col sm:flex-row gap-4">
            <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center">
              {store.logo ? <img src={store.logo} alt={store.name} className="h-full w-full object-cover" /> : <StoreIcon className="h-10 w-10 text-primary" />}
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <h1 className="text-xl sm:text-3xl font-bold text-foreground">{store.name}</h1>
              {store.description && <p className="text-sm text-muted-foreground">{store.description}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {store.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" />{store.location}</span>}
                {store.phone && <a href={`tel:${store.phone}`} className="flex items-center gap-1 hover:text-primary"><Phone className="h-3.5 w-3.5 text-primary" />{store.phone}</a>}
                {store.opening_hours && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" />{store.opening_hours}</span>}
              </div>
              {map && (
                <a href={map} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="mt-2 h-8 text-xs"><MapPin className="h-3.5 w-3.5 mr-1" /> Open in map</Button>
                </a>
              )}
            </div>
          </section>
        )}

        {store && (
          <>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {categories.map((c) => (
                <Button key={c} size="sm" variant={category === c ? "default" : "outline"} className="h-7 text-xs px-2.5" onClick={() => setCategory(c)}>
                  {c}
                </Button>
              ))}
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No products in this store yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                {filtered.map((p, idx) => (
                  <ProductCard key={p.id} id={p.id} name={p.name} price={p.price} image={p.image} category={p.category}
                    isWholesale={isWholesale} unit={p.unit || "piece"} wholesalePrice={p.wholesale_price}
                    minWholesaleQty={p.min_wholesale_qty} priority={idx < 6} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StoreDetail;
