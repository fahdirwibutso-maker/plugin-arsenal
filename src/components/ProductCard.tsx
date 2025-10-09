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
}

const ProductCard = ({ id, name, price, image, category }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/20">
      <Link to={`/product/${id}`}>
        <div className="aspect-[3/4] overflow-hidden bg-secondary">
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
        <p className="text-sm font-bold text-primary mt-0.5">${price.toFixed(2)}</p>
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
