import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      toast({
        title: "Please login",
        description: "You need to login to add items to cart",
        variant: "destructive",
      });
      return;
    }

    // Check if item already exists in cart
    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", id.toString())
      .maybeSingle();

    if (existing) {
      // Update quantity
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);
    } else {
      // Insert new cart item
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
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/20">
      <Link to={`/product/${id}`}>
        <div className="aspect-square overflow-hidden bg-secondary">
          <img 
            src={image} 
            alt={name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-2">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0">{category}</p>
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-1 mt-0.5">
          <p className="text-sm font-bold text-primary">${displayPrice.toFixed(2)}</p>
          {isWholesale && (
            <p className="text-[9px] text-muted-foreground line-through">${price.toFixed(2)}</p>
          )}
        </div>
        {isWholesale && (
          <p className="text-[8px] text-primary/70 mt-0.5">Min: {minWholesaleQty} units</p>
        )}
      </CardContent>
      <CardFooter className="p-2 pt-0">
        <Button className="w-full h-7 text-[10px]" size="sm" onClick={handleAddToCart}>
          <ShoppingCart className="mr-1 h-3 w-3" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
