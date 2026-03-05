import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LazyImage from "@/components/LazyImage";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  isWholesale?: boolean;
  unit?: string;
  wholesalePrice?: number | null;
  minWholesaleQty?: number | null;
}

const WHOLESALE_UNITS = ["bag", "carton", "kg", "pack"];

const ProductCard = ({ id, name, price, image, category, isWholesale = false, unit = "piece", wholesalePrice, minWholesaleQty }: ProductCardProps) => {
  const unitLower = unit.toLowerCase();
  const isBulkUnit = WHOLESALE_UNITS.includes(unitLower);
  const isBulkQty = minWholesaleQty !== null && minWholesaleQty !== undefined && minWholesaleQty >= 12;
  const canWholesale = (isBulkUnit || isBulkQty) && wholesalePrice != null && wholesalePrice > 0;
  const displayPrice = isWholesale && canWholesale ? wholesalePrice! : price;
  const { toast } = useToast();

  const handleAddToCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const existingIndex = guestCart.findIndex((item: any) => item.product_id === id);

      if (existingIndex >= 0) {
        guestCart[existingIndex].quantity += 1;
      } else {
        guestCart.push({
          product_id: id,
          product_name: name,
          product_price: displayPrice,
          product_image: image,
          quantity: 1,
        });
      }

      localStorage.setItem("guestCart", JSON.stringify(guestCart));
      window.dispatchEvent(new CustomEvent("cart-updated"));
      toast({ title: "Added to cart", description: `${name} has been added to your cart` });
      return;
    }

    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: id,
        product_name: name,
        product_price: displayPrice,
        product_image: image,
        quantity: 1,
      });
    }

    window.dispatchEvent(new CustomEvent("cart-updated"));
    toast({ title: "Added to cart", description: `${name} has been added to your cart` });
  };

  return (
    <div className="futuristic-card group transition-all duration-300 hover:scale-[1.02]">
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
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>

      <CardContent className="p-2 sm:p-3 relative">
        <p className="text-[8px] sm:text-[9px] text-primary/70 uppercase tracking-widest mb-0.5 sm:mb-1 font-medium">{category}</p>
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
          <p className="text-sm sm:text-lg font-bold text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]">
            {displayPrice.toLocaleString()} <span className="text-[10px] sm:text-xs font-normal">FRw/{unit}</span>
          </p>
          {isWholesale && canWholesale && (
            <p className="text-[9px] sm:text-[10px] text-muted-foreground line-through">{price.toLocaleString()} FRw</p>
          )}
        </div>
        {isWholesale && canWholesale && (
          <p className="text-[8px] sm:text-[9px] text-primary/60 mt-0.5 sm:mt-1 font-medium">
            {isBulkUnit ? `Sold per ${unit}` : `Min: ${minWholesaleQty} pcs`}
          </p>
        )}
        {!canWholesale && isWholesale && (
          <p className="text-[8px] sm:text-[9px] text-muted-foreground mt-0.5 sm:mt-1">Retail only</p>
        )}
      </CardContent>

      <CardFooter className="p-2 sm:p-3 pt-0">
        <Button
          className="w-full h-7 sm:h-8 text-[10px] sm:text-[11px] font-medium bg-primary/90 hover:bg-primary border-0 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
          size="sm"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
          Add to Cart
        </Button>
      </CardFooter>
    </div>
  );
};

export default ProductCard;
