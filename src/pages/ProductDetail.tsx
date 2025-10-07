import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Share2, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock product data
const productData = {
  id: 1,
  name: "Arsenal Home Jersey 23/24",
  price: 89.99,
  description: "Show your support with the official Arsenal home jersey for the 23/24 season. Featuring the iconic red and white colors with modern performance fabric technology.",
  images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  category: "Jerseys",
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  inStock: true,
  features: [
    "Official licensed product",
    "Breathable performance fabric",
    "Regular fit",
    "100% Polyester"
  ]
};

const ProductDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} />
      
      <main className="container py-8">
        <Link to="/shop" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
              <img 
                src={productData.images[0]} 
                alt={productData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {productData.images.slice(1).map((img, idx) => (
                <div key={idx} className="aspect-square bg-secondary rounded-lg overflow-hidden cursor-pointer hover:opacity-80">
                  <img src={img} alt={`${productData.name} ${idx + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                {productData.category}
              </p>
              <h1 className="text-4xl font-bold text-foreground mb-4">{productData.name}</h1>
              <p className="text-3xl font-bold text-primary">${productData.price}</p>
            </div>

            <p className="text-muted-foreground leading-relaxed">{productData.description}</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Size</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {productData.sizes.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1" size="lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-3">Features</h3>
              <ul className="space-y-2">
                {productData.features.map((feature, idx) => (
                  <li key={idx} className="text-muted-foreground flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
