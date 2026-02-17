import { useState, useMemo } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  "All", "Fresh Fruits", "Vegetables", "Dairy", "Meat", "Bakery",
  "Beverages", "Pantry", "Snacks", "Frozen", "Household", "Personal Care",
];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [isWholesale, setIsWholesale] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = useMemo(() => {
    let filtered = selectedCategory === "All"
      ? products
      : products.filter(p => p.category === selectedCategory);

    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === "price-low") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      filtered = [...filtered].reverse();
    }

    return filtered;
  }, [selectedCategory, searchQuery, sortBy, products]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItemCount={0}
        isWholesale={isWholesale}
        onWholesaleToggle={setIsWholesale}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="container py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Shop Fresh & Quality Products</h1>
              <p className="text-muted-foreground">Browse our complete range of groceries, beverages, and fresh produce</p>
            </div>
            {isWholesale && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
                <p className="text-sm font-semibold text-primary">🏪 Wholesale Mode Active</p>
                <p className="text-xs text-muted-foreground">Bulk pricing • Min. quantities apply</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                category={product.category}
                isWholesale={isWholesale}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Shop;
