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

      <main className="container px-4 sm:px-6 py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">Shop Fresh & Quality Products</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Browse our complete range of groceries, beverages, and fresh produce</p>
            </div>
            {isWholesale && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 self-start sm:self-auto">
                <p className="text-xs sm:text-sm font-semibold text-primary">🏪 Wholesale Mode Active</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Bulk pricing • Min. quantities apply</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
                className="text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-9 px-2 sm:px-3"
              >
                {category}
              </Button>
            ))}
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                category={product.category}
                isWholesale={isWholesale}
                unit={(product as any).unit || "piece"}
                wholesalePrice={product.wholesale_price}
                minWholesaleQty={product.min_wholesale_qty}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Shop;
