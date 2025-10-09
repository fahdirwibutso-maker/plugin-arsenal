import { Link } from "react-router-dom";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, CreditCard } from "lucide-react";

// Featured boutique products
const featuredProducts = [
  { id: 1, name: "Silk Evening Dress", price: 189.99, image: "/placeholder.svg", category: "Dresses" },
  { id: 2, name: "Cashmere Sweater", price: 149.99, image: "/placeholder.svg", category: "Tops" },
  { id: 3, name: "Leather Handbag", price: 229.99, image: "/placeholder.svg", category: "Bags" },
  { id: 4, name: "Designer Sunglasses", price: 159.99, image: "/placeholder.svg", category: "Accessories" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent/30 via-background to-background py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkZGQ2ZmUiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnptMCAwIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        <div className="container relative">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Elegant Style
              <span className="text-primary block mt-2">Boutique Collection</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Discover curated collections of premium fashion. From evening wear to everyday elegance, 
              find your perfect style with our exclusive pieces.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button size="lg" className="text-base h-12 px-8 shadow-lg hover:shadow-xl transition-all">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base h-12 px-8 hover:bg-accent transition-all">
                View Collections
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-y border-border bg-secondary/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="flex items-start gap-4 group">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
                <Truck className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg mb-1">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">On all orders over $100</p>
              </div>
            </div>
            <div className="flex items-start gap-4 group">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg mb-1">Secure Payment</h3>
                <p className="text-sm text-muted-foreground">100% secure transactions</p>
              </div>
            </div>
            <div className="flex items-start gap-4 group">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
                <CreditCard className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg mb-1">Easy Returns</h3>
                <p className="text-sm text-muted-foreground">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-3">Featured Products</h2>
              <p className="text-muted-foreground text-lg">Discover our most loved pieces</p>
            </div>
            <Link to="/shop">
              <Button variant="outline" size="lg" className="hover:bg-accent">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary to-primary-light relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnptMCAwIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="container text-center relative">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Join Our Exclusive Circle
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Sign up for exclusive offers, early access to new collections, and personalized styling tips
          </p>
          <Button size="lg" variant="secondary" className="text-base h-12 px-8 shadow-xl hover:shadow-2xl transition-all">
            Sign Up Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
