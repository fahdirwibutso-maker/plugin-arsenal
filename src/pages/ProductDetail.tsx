import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Share2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleAddToCart = async () => {
    if (!product) return;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const existingIndex = guestCart.findIndex((item: any) => item.product_id === product.id);
      if (existingIndex >= 0) {
        guestCart[existingIndex].quantity += 1;
      } else {
        guestCart.push({
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          product_image: product.image,
          quantity: 1,
        });
      }
      localStorage.setItem("guestCart", JSON.stringify(guestCart));
      toast({ title: "Added to cart", description: `${product.name} has been added to your cart` });
      return;
    }

    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_image: product.image,
        quantity: 1,
      });
    }
    toast({ title: "Added to cart", description: `${product.name} has been added to your cart` });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemCount={0} />
        <main className="container py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemCount={0} />
        <main className="container py-8 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Link to="/shop" className="text-primary underline mt-4 inline-block">Back to Shop</Link>
        </main>
      </div>
    );
  }

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
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h1 className="text-4xl font-bold text-foreground mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-primary">{product.price.toFixed(0)} FRw</p>
              {product.wholesale_price && (
                <p className="text-lg text-muted-foreground mt-1">Wholesale: {product.wholesale_price.toFixed(0)} FRw</p>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Stock: {product.stock} available</p>

              <div className="flex gap-4">
                <Button className="flex-1" size="lg" onClick={handleAddToCart}>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
