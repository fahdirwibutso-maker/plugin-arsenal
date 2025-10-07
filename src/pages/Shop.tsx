import { useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock product data
const products = [
  { id: 1, name: "Arsenal Home Jersey 23/24", price: 89.99, image: "/placeholder.svg", category: "Jerseys" },
  { id: 2, name: "Arsenal Away Jersey 23/24", price: 89.99, image: "/placeholder.svg", category: "Jerseys" },
  { id: 3, name: "Arsenal Training Kit", price: 64.99, image: "/placeholder.svg", category: "Training" },
  { id: 4, name: "Arsenal Hoodie", price: 54.99, image: "/placeholder.svg", category: "Apparel" },
  { id: 5, name: "Arsenal Cap", price: 24.99, image: "/placeholder.svg", category: "Accessories" },
  { id: 6, name: "Arsenal Scarf", price: 19.99, image: "/placeholder.svg", category: "Accessories" },
  { id: 7, name: "Arsenal Football", price: 29.99, image: "/placeholder.svg", category: "Equipment" },
  { id: 8, name: "Arsenal Water Bottle", price: 14.99, image: "/placeholder.svg", category: "Accessories" },
];

const categories = ["All", "Jerseys", "Training", "Apparel", "Accessories", "Equipment"];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Shop All Products</h1>
          <p className="text-muted-foreground">Browse our complete collection</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Shop;
