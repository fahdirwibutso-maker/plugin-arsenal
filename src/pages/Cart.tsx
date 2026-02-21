import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  quantity: number;
  size?: string;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchCartItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Load guest cart from localStorage
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      setCartItems(guestCart.map((item: any, index: number) => ({ ...item, id: `guest-${index}` })));
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id);

    if (!error && data) {
      setCartItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Update guest cart
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const index = parseInt(id.replace("guest-", ""));
      if (guestCart[index]) {
        guestCart[index].quantity = newQuantity;
        localStorage.setItem("guestCart", JSON.stringify(guestCart));
        fetchCartItems();
      }
      return;
    }
    
    await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", id);
    
    fetchCartItems();
  };

  const removeItem = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Remove from guest cart
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const index = parseInt(id.replace("guest-", ""));
      guestCart.splice(index, 1);
      localStorage.setItem("guestCart", JSON.stringify(guestCart));
      toast({ title: "Item removed from cart" });
      fetchCartItems();
      return;
    }
    
    await supabase.from("cart_items").delete().eq("id", id);
    toast({ title: "Item removed from cart" });
    fetchCartItems();
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
  const shipping = subtotal > 0 ? 9.99 : 0;
  const total = subtotal + shipping;

  if (loading) return <div className="min-h-screen bg-background"><Header cartItemCount={0} /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} />
      
      <main className="container px-4 sm:px-6 py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">Your cart is empty</p>
            <Link to="/shop">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-secondary rounded overflow-hidden flex-shrink-0">
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{item.product_name}</h3>
                          {item.size && <p className="text-sm text-muted-foreground">Size: {item.size}</p>}
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-lg font-bold text-primary">{(item.product_price * item.quantity).toFixed(0)} FRw</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(0)} FRw</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping.toFixed(0)} FRw</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{total.toFixed(0)} FRw</span>
                </div>
              </div>

              <Link to="/checkout">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
              
              <Link to="/shop">
                <Button variant="outline" className="w-full mt-2">
                  Continue Shopping
                </Button>
              </Link>
            </Card>
          </div>
        </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
