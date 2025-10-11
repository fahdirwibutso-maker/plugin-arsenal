import { useState, useMemo } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Supermarket product data
const products = [
  // Fresh Fruits
  { id: 1, name: "Organic Apples", price: 4.99, image: "/placeholder.svg", category: "Fresh Fruits" },
  { id: 2, name: "Bananas", price: 2.49, image: "/placeholder.svg", category: "Fresh Fruits" },
  { id: 3, name: "Fresh Oranges", price: 5.99, image: "/placeholder.svg", category: "Fresh Fruits" },
  { id: 4, name: "Strawberries", price: 6.99, image: "/placeholder.svg", category: "Fresh Fruits" },
  { id: 5, name: "Grapes", price: 7.99, image: "/placeholder.svg", category: "Fresh Fruits" },
  { id: 6, name: "Watermelon", price: 8.99, image: "/placeholder.svg", category: "Fresh Fruits" },
  
  // Vegetables
  { id: 7, name: "Fresh Tomatoes", price: 3.99, image: "/placeholder.svg", category: "Vegetables" },
  { id: 8, name: "Carrots", price: 2.99, image: "/placeholder.svg", category: "Vegetables" },
  { id: 9, name: "Lettuce", price: 2.49, image: "/placeholder.svg", category: "Vegetables" },
  { id: 10, name: "Onions", price: 1.99, image: "/placeholder.svg", category: "Vegetables" },
  { id: 11, name: "Potatoes 5kg", price: 6.99, image: "/placeholder.svg", category: "Vegetables" },
  { id: 12, name: "Bell Peppers", price: 4.99, image: "/placeholder.svg", category: "Vegetables" },
  
  // Dairy
  { id: 13, name: "Fresh Milk 2L", price: 3.49, image: "/placeholder.svg", category: "Dairy" },
  { id: 14, name: "Cheddar Cheese", price: 6.99, image: "/placeholder.svg", category: "Dairy" },
  { id: 15, name: "Greek Yogurt", price: 4.49, image: "/placeholder.svg", category: "Dairy" },
  { id: 16, name: "Butter", price: 5.99, image: "/placeholder.svg", category: "Dairy" },
  { id: 17, name: "Eggs (12 pack)", price: 4.99, image: "/placeholder.svg", category: "Dairy" },
  { id: 18, name: "Ice Cream", price: 7.99, image: "/placeholder.svg", category: "Dairy" },
  
  // Meat & Seafood
  { id: 19, name: "Fresh Chicken", price: 12.99, image: "/placeholder.svg", category: "Meat" },
  { id: 20, name: "Ground Beef", price: 15.99, image: "/placeholder.svg", category: "Meat" },
  { id: 21, name: "Pork Chops", price: 14.99, image: "/placeholder.svg", category: "Meat" },
  { id: 22, name: "Salmon Fillet", price: 18.99, image: "/placeholder.svg", category: "Meat" },
  { id: 23, name: "Shrimp", price: 16.99, image: "/placeholder.svg", category: "Meat" },
  
  // Bakery
  { id: 24, name: "Whole Wheat Bread", price: 2.99, image: "/placeholder.svg", category: "Bakery" },
  { id: 25, name: "Croissants", price: 5.99, image: "/placeholder.svg", category: "Bakery" },
  { id: 26, name: "Bagels", price: 4.49, image: "/placeholder.svg", category: "Bakery" },
  { id: 27, name: "Donuts (6 pack)", price: 6.99, image: "/placeholder.svg", category: "Bakery" },
  { id: 28, name: "Dinner Rolls", price: 3.99, image: "/placeholder.svg", category: "Bakery" },
  
  // Beverages
  { id: 29, name: "Orange Juice 2L", price: 5.99, image: "/placeholder.svg", category: "Beverages" },
  { id: 30, name: "Coca Cola 2L", price: 3.99, image: "/placeholder.svg", category: "Beverages" },
  { id: 31, name: "Pepsi 2L", price: 3.99, image: "/placeholder.svg", category: "Beverages" },
  { id: 32, name: "Sprite 2L", price: 3.99, image: "/placeholder.svg", category: "Beverages" },
  { id: 33, name: "Bottled Water (24pk)", price: 7.99, image: "/placeholder.svg", category: "Beverages" },
  { id: 34, name: "Energy Drink", price: 2.99, image: "/placeholder.svg", category: "Beverages" },
  { id: 35, name: "Coffee Beans", price: 12.99, image: "/placeholder.svg", category: "Beverages" },
  { id: 36, name: "Tea Bags", price: 4.99, image: "/placeholder.svg", category: "Beverages" },
  
  // Pantry
  { id: 37, name: "White Rice 5kg", price: 12.99, image: "/placeholder.svg", category: "Pantry" },
  { id: 38, name: "Pasta", price: 1.99, image: "/placeholder.svg", category: "Pantry" },
  { id: 39, name: "Olive Oil", price: 9.99, image: "/placeholder.svg", category: "Pantry" },
  { id: 40, name: "Sugar 2kg", price: 4.99, image: "/placeholder.svg", category: "Pantry" },
  { id: 41, name: "Flour 2kg", price: 3.99, image: "/placeholder.svg", category: "Pantry" },
  { id: 42, name: "Canned Tomatoes", price: 2.49, image: "/placeholder.svg", category: "Pantry" },
  { id: 43, name: "Peanut Butter", price: 5.99, image: "/placeholder.svg", category: "Pantry" },
  { id: 44, name: "Honey", price: 8.99, image: "/placeholder.svg", category: "Pantry" },
  
  // Snacks
  { id: 45, name: "Potato Chips", price: 3.99, image: "/placeholder.svg", category: "Snacks" },
  { id: 46, name: "Chocolate Bar", price: 1.99, image: "/placeholder.svg", category: "Snacks" },
  { id: 47, name: "Cookies", price: 4.49, image: "/placeholder.svg", category: "Snacks" },
  { id: 48, name: "Nuts Mix", price: 6.99, image: "/placeholder.svg", category: "Snacks" },
  { id: 49, name: "Popcorn", price: 2.99, image: "/placeholder.svg", category: "Snacks" },
  
  // Frozen Foods
  { id: 50, name: "Frozen Pizza", price: 7.99, image: "/placeholder.svg", category: "Frozen" },
  { id: 51, name: "Frozen Vegetables", price: 4.99, image: "/placeholder.svg", category: "Frozen" },
  { id: 52, name: "French Fries", price: 3.99, image: "/placeholder.svg", category: "Frozen" },
  { id: 53, name: "Ice Cream Bars", price: 5.99, image: "/placeholder.svg", category: "Frozen" },
  
  // Household
  { id: 54, name: "Paper Towels", price: 8.99, image: "/placeholder.svg", category: "Household" },
  { id: 55, name: "Toilet Paper (12pk)", price: 12.99, image: "/placeholder.svg", category: "Household" },
  { id: 56, name: "Dish Soap", price: 3.99, image: "/placeholder.svg", category: "Household" },
  { id: 57, name: "Laundry Detergent", price: 14.99, image: "/placeholder.svg", category: "Household" },
  
  // Personal Care
  { id: 58, name: "Shampoo", price: 6.99, image: "/placeholder.svg", category: "Personal Care" },
  { id: 59, name: "Toothpaste", price: 4.99, image: "/placeholder.svg", category: "Personal Care" },
  { id: 60, name: "Body Soap", price: 3.99, image: "/placeholder.svg", category: "Personal Care" },
];

const categories = ["All", "Fresh Fruits", "Vegetables", "Dairy", "Meat", "Bakery", "Beverages", "Pantry", "Snacks", "Frozen", "Household", "Personal Care"];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [isWholesale, setIsWholesale] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    
    return filtered;
  }, [selectedCategory, searchQuery]);

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

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              {...product} 
              isWholesale={isWholesale}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Shop;
