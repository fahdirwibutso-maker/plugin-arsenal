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
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/10 border-border/50 hover:border-primary/20 bg-card">
      <Link to={`/product/${id}`}>
        <div className="aspect-square overflow-hidden bg-secondary/50">
          <img 
            src={image} 
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 font-medium">{category}</p>
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 min-h-[2.5rem]">
            {name}
          </h3>
        </Link>
        <p className="text-lg font-bold text-primary">${price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full h-10 text-sm font-medium shadow-sm hover:shadow-md transition-all">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
