import { useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock boutique product data
const products = [
  { id: 1, name: "Silk Evening Dress", price: 189.99, image: "/placeholder.svg", category: "Dresses" },
  { id: 2, name: "Cashmere Sweater", price: 149.99, image: "/placeholder.svg", category: "Tops" },
  { id: 3, name: "Leather Handbag", price: 229.99, image: "/placeholder.svg", category: "Bags" },
  { id: 4, name: "Designer Sunglasses", price: 159.99, image: "/placeholder.svg", category: "Accessories" },
  { id: 5, name: "Tailored Blazer", price: 199.99, image: "/placeholder.svg", category: "Outerwear" },
  { id: 6, name: "Satin Blouse", price: 89.99, image: "/placeholder.svg", category: "Tops" },
  { id: 7, name: "High-Waist Trousers", price: 119.99, image: "/placeholder.svg", category: "Bottoms" },
  { id: 8, name: "Pearl Necklace", price: 179.99, image: "/placeholder.svg", category: "Jewelry" },
  { id: 9, name: "Suede Ankle Boots", price: 169.99, image: "/placeholder.svg", category: "Shoes" },
  { id: 10, name: "Cocktail Dress", price: 209.99, image: "/placeholder.svg", category: "Dresses" },
  { id: 11, name: "Wool Coat", price: 289.99, image: "/placeholder.svg", category: "Outerwear" },
  { id: 12, name: "Silk Scarf", price: 69.99, image: "/placeholder.svg", category: "Accessories" },
];

const categories = ["All", "Dresses", "Tops", "Bottoms", "Outerwear", "Bags", "Shoes", "Jewelry", "Accessories"];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} />
      
      <main className="container py-10">
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-foreground mb-3">Shop All Products</h1>
          <p className="text-muted-foreground text-lg">Browse our complete collection of premium fashion</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-10 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="transition-all hover:scale-105"
                size="lg"
              >
                {category}
              </Button>
            ))}
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-56 h-11">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Shop;
