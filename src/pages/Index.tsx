import { Link } from "react-router-dom";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, CreditCard } from "lucide-react";

// Featured products
const featuredProducts = [
  { id: 1, name: "Arsenal Home Jersey 23/24", price: 89.99, image: "/placeholder.svg", category: "Jerseys" },
  { id: 2, name: "Arsenal Away Jersey 23/24", price: 89.99, image: "/placeholder.svg", category: "Jerseys" },
  { id: 3, name: "Arsenal Training Kit", price: 64.99, image: "/placeholder.svg", category: "Training" },
  { id: 4, name: "Arsenal Hoodie", price: 54.99, image: "/placeholder.svg", category: "Apparel" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/20 via-background to-background py-20 lg:py-32">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Arsenal Official
              <span className="text-primary block">Shop</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Get the latest official Arsenal merchandise. From jerseys to accessories, 
              show your support for the Gunners.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button size="lg" className="text-base">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base">
                View Collections
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
                <h3 className="font-semibold text-foreground">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">On orders over $100</p>
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
                <h3 className="font-semibold text-foreground">Easy Returns</h3>
                <p className="text-sm text-muted-foreground">30-day return policy</p>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            Join the Arsenal Family
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Sign up for exclusive offers, early access to new products, and more
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
