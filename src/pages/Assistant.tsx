import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useCartCount } from "@/hooks/useCartCount";
import { useWholesaleStatus } from "@/hooks/useWholesaleStatus";
import { useStores } from "@/hooks/useStores";
import { matchCatalog, isDirectSearch } from "@/lib/assistantSearch";
import type { Tables } from "@/integrations/supabase/types";

const examples = ["Ingredients for a family breakfast", "Drinks for a party of 20", "Cleaning supplies for a new home"];

const Assistant = () => {
  const requestId = useRef(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ summary: string; items: { id: string; reason: string }[] } | null>(null);
  const { count } = useCartCount();
  const { isWholesale } = useWholesaleStatus();
  const { data: stores = [] } = useStores();
  const storeMap = new Map(stores.map((s) => [s.id, s.name]));
  const [products, setProducts] = useState<Tables<'products'>[]>([]);
  const catalogQuery = useQuery({
    queryKey: ["assistant-catalog"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("is_active", true).gt("stock", 0).order("id").limit(500);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });

  const ask = async (text = query) => {
    if (!text.trim() || loading) return;
    const current = ++requestId.current;
    setQuery(text); setLoading(true); setError(null);
    try {
      const catalog = catalogQuery.isStale ? (await catalogQuery.refetch()).data ?? [] : catalogQuery.data ?? [];
      const matches = matchCatalog(text, catalog);
      setProducts(matches);
      setResult(matches.length ? { summary: `Matching products for “${text.trim()}”`, items: matches.map(p => ({ id: p.id, reason: '' })) } : null);
      if (isDirectSearch(text, catalog)) return;
      const { data, error } = await supabase.functions.invoke("recommend-products", { body: { query: text } });
      if (current !== requestId.current) return;
      if (error || data?.error) {
        let msg = data?.error;
        try { msg = msg || (await error?.context?.json())?.error; } catch { /* response may not be JSON */ }
        throw new Error(msg || "Something went wrong. Please try again.");
      }
      setResult(data);
      setProducts(data.products ?? data.items.map((item: {id: string}) => catalog.find(p => p.id === item.id)).filter(Boolean));
    } catch (e) {
      if (current === requestId.current) setError(e instanceof Error ? e.message : 'Unable to search. Please try again.');
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Helmet><title>Shopping Assistant — WellarShop</title></Helmet>
      <Header cartItemCount={count} isWholesale={isWholesale} />
      <main className="container px-4 sm:px-6 py-6 max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" /> Shopping Assistant
        </h1>
        <p className="text-sm text-muted-foreground mb-4">Tell us what you need — we'll find matching products across all stores.</p>
        <div className="futuristic-card p-4 space-y-3">
          <Textarea aria-label="Shopping request" value={query} onChange={(e) => setQuery(e.target.value)} maxLength={500}
            placeholder="e.g. I'm cooking dinner for 6 people tonight" rows={3} />
          <div className="flex flex-wrap gap-2 items-center">
            <Button onClick={() => ask()} disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />} Find products
            </Button>
            {examples.map((e) => (
              <Button key={e} size="sm" variant="outline" className="text-xs h-7" onClick={() => ask(e)} disabled={loading}>{e}</Button>
            ))}
          </div>
        </div>
        {error && <p className="text-destructive text-sm mt-4">{error}</p>}
        {result && (
          <section className="mt-6">
            <p className="text-foreground mb-4">{result.summary}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {products.map((p) => (
                <div key={p.id} className="space-y-1">
                  <ProductCard id={p.id} name={p.name} price={p.price} image={p.image} category={p.category}
                    isWholesale={isWholesale} unit={p.unit || "piece"} wholesalePrice={p.wholesale_price}
                    minWholesaleQty={p.min_wholesale_qty} storeName={p.store_id ? storeMap.get(p.store_id) : undefined} priority />
                  <p className="text-[11px] text-muted-foreground px-1">{result.items.find((i) => i.id === p.id)?.reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Assistant;
