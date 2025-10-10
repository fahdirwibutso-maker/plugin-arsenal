import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

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
        <Button className="w-full h-7 text-[10px]" size="sm">
          <ShoppingCart className="mr-1 h-3 w-3" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
