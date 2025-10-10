import { useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Supermarket product data
const products = [
  { id: 1, name: "Organic Apples", price: 4.99, image: "/placeholder.svg", category: "Fresh Fruits" },
  { id: 2, name: "Fresh Milk", price: 3.49, image: "/placeholder.svg", category: "Dairy" },
  { id: 3, name: "Whole Wheat Bread", price: 2.99, image: "/placeholder.svg", category: "Bakery" },
  { id: 4, name: "Orange Juice", price: 5.99, image: "/placeholder.svg", category: "Beverages" },
  { id: 5, name: "Fresh Chicken", price: 12.99, image: "/placeholder.svg", category: "Meat" },
  { id: 6, name: "Cheddar Cheese", price: 6.99, image: "/placeholder.svg", category: "Dairy" },
  { id: 7, name: "Bananas", price: 2.49, image: "/placeholder.svg", category: "Fresh Fruits" },
  { id: 8, name: "Coca Cola 2L", price: 3.99, image: "/placeholder.svg", category: "Beverages" },
  { id: 9, name: "Ground Beef", price: 15.99, image: "/placeholder.svg", category: "Meat" },
  { id: 10, name: "Greek Yogurt", price: 4.49, image: "/placeholder.svg", category: "Dairy" },
  { id: 11, name: "Croissants", price: 5.99, image: "/placeholder.svg", category: "Bakery" },
  { id: 12, name: "Fresh Tomatoes", price: 3.99, image: "/placeholder.svg", category: "Vegetables" },
  { id: 13, name: "Pepsi 2L", price: 3.99, image: "/placeholder.svg", category: "Beverages" },
  { id: 14, name: "Carrots", price: 2.99, image: "/placeholder.svg", category: "Vegetables" },
  { id: 15, name: "White Rice 5kg", price: 12.99, image: "/placeholder.svg", category: "Pantry" },
  { id: 16, name: "Pasta", price: 1.99, image: "/placeholder.svg", category: "Pantry" },
];

const categories = ["All", "Fresh Fruits", "Vegetables", "Dairy", "Meat", "Bakery", "Beverages", "Pantry"];

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
          <h1 className="text-4xl font-bold text-foreground mb-2">Shop Fresh & Quality Products</h1>
          <p className="text-muted-foreground">Browse our complete range of groceries, beverages, and fresh produce</p>
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

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Shop;
