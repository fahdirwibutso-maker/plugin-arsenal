import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, CreditCard } from "lucide-react";
import supermarket1 from "@/assets/supermarket-1.jpg";
import supermarket2 from "@/assets/supermarket-2.jpg";
import supermarket3 from "@/assets/supermarket-3.jpg";

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
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [supermarket1, supermarket2, supermarket3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, []);
  
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
      <section className="relative overflow-hidden h-[160px]">
        {/* Background Slideshow */}
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="absolute inset-0 transition-opacity duration-2000 ease-in-out"
              style={{
                opacity: currentSlide === index ? 1 : 0,
                backgroundImage: `url(${slide})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/50" />
        </div>

        {/* Content */}
        <div className="container relative h-full flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-xl font-bold mb-2 leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Fresh Quality
              </span>
              <span className="block text-foreground">Every Day</span>
            </h1>
            <p className="text-xs text-muted-foreground mb-3">
              Your trusted supermarket for wholesale and retail. Fresh produce, quality groceries, 
              and beverages at the best prices.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link to="/shop">
                <Button size="sm" className="text-[10px] h-7 px-3">
                  Shop Now
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
              <Button size="sm" variant="outline" className="text-[10px] h-7 px-3">
                Wholesale Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="h-[50px] border-y border-border flex items-center">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-xs">Fast Delivery</h3>
                <p className="text-[10px] text-muted-foreground">Same-day delivery available</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-xs">Secure Payment</h3>
                <p className="text-[10px] text-muted-foreground">100% secure transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-xs">Fresh Guarantee</h3>
                <p className="text-[10px] text-muted-foreground">Quality freshness assured</p>
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
