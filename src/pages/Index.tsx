import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, CreditCard } from "lucide-react";

// Featured products
const featuredProducts = [
  { id: 1, name: "Organic Apples", price: 4.99, image: "/placeholder.svg", category: "Fresh Fruits" },
  { id: 2, name: "Fresh Milk 2L", price: 3.49, image: "/placeholder.svg", category: "Dairy" },
  { id: 3, name: "Whole Wheat Bread", price: 2.99, image: "/placeholder.svg", category: "Bakery" },
  { id: 4, name: "Orange Juice 2L", price: 5.99, image: "/placeholder.svg", category: "Beverages" },
  { id: 5, name: "Fresh Chicken", price: 12.99, image: "/placeholder.svg", category: "Meat" },
  { id: 6, name: "Strawberries", price: 6.99, image: "/placeholder.svg", category: "Fresh Fruits" },
  { id: 7, name: "Cheddar Cheese", price: 6.99, image: "/placeholder.svg", category: "Dairy" },
  { id: 8, name: "Coca Cola 2L", price: 3.99, image: "/placeholder.svg", category: "Beverages" },
];

const Index = () => {
  const [isWholesale, setIsWholesale] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartItemCount={0} 
        isWholesale={isWholesale}
        onWholesaleToggle={setIsWholesale}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20 lg:py-32">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Fresh Quality
              <span className="text-primary block">Every Day</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your trusted supermarket for wholesale and retail. Fresh produce, quality groceries, 
              and beverages at the best prices.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button size="lg" className="text-base">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base">
                Wholesale Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-y border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">Same-day delivery available</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Secure Payment</h3>
                <p className="text-sm text-muted-foreground">100% secure transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Fresh Guarantee</h3>
                <p className="text-sm text-muted-foreground">Quality freshness assured</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Check out our most popular items</p>
            </div>
            <Link to="/shop">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {featuredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                {...product} 
                isWholesale={isWholesale}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            Join FreshMart Rewards
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Get exclusive deals, wholesale pricing access, and earn points on every purchase
          </p>
          <Button size="lg" variant="secondary" className="text-base">
            Sign Up Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
