import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LazyImage from "@/components/LazyImage";
interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  isWholesale?: boolean;
}

const ProductCard = ({ id, name, price, image, category, isWholesale = false }: ProductCardProps) => {
  const wholesaleDiscount = 0.25; // 25% discount for wholesale
  const displayPrice = isWholesale ? price * (1 - wholesaleDiscount) : price;
  const minWholesaleQty = 10;
  const { toast } = useToast();

  const handleAddToCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Guest user - save to localStorage
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const existingIndex = guestCart.findIndex((item: any) => item.product_id === id.toString());
      
      if (existingIndex >= 0) {
        guestCart[existingIndex].quantity += 1;
      } else {
        guestCart.push({
          product_id: id.toString(),
          product_name: name,
          product_price: displayPrice,
          product_image: image,
          quantity: 1,
        });
      }
      
      localStorage.setItem("guestCart", JSON.stringify(guestCart));
      toast({
        title: "Added to cart",
        description: `${name} has been added to your cart`,
      });
      return;
    }

    // Logged in user - save to database
    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", id.toString())
      .maybeSingle();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: id.toString(),
        product_name: name,
        product_price: displayPrice,
        product_image: image,
        quantity: 1,
      });
    }

    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart`,
    });
  };
  
  return (
    <div className="futuristic-card group transition-all duration-300 hover:scale-[1.02]">
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
      </div>
      
      <Link to={`/product/${id}`}>
        <div className="aspect-square overflow-hidden bg-secondary/50 relative">
          <LazyImage 
            src={image} 
            alt={name}
            className="h-full w-full transition-transform duration-500 group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>
      
      <CardContent className="p-3 relative">
        <p className="text-[9px] text-primary/70 uppercase tracking-widest mb-1 font-medium">{category}</p>
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
            {name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-lg font-bold text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]">
            {displayPrice.toFixed(0)} <span className="text-xs font-normal">FRw</span>
          </p>
          {isWholesale && (
            <p className="text-[10px] text-muted-foreground line-through">{price.toFixed(0)} FRw</p>
          )}
        </div>
        {isWholesale && (
          <p className="text-[9px] text-primary/60 mt-1 font-medium">Min: {minWholesaleQty} units</p>
        )}
      </CardContent>
      
      <CardFooter className="p-3 pt-0">
        <Button 
          className="w-full h-8 text-[11px] font-medium bg-primary/90 hover:bg-primary border-0 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300" 
          size="sm" 
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
          Add to Cart
        </Button>
      </CardFooter>
    </div>
  );
};

export default ProductCard;
