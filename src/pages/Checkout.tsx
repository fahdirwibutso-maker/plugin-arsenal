import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
});

interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  quantity: number;
}

const Checkout = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    address: "",
    city: "",
    country: "rw",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsGuest(true);
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        setCartItems(guestCart.map((item: any, index: number) => ({
          ...item,
          id: `guest-${index}`,
          product_image: item.product_image || "",
        })));
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id);

      if (data) setCartItems(data as CartItem[]);
      setLoading(false);
    };

    fetchCart();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
  const shipping = subtotal > 50000 ? 0 : 2000;
  const total = subtotal + shipping;

  const createOrder = async (userId: string) => {
    const address = `${formData.address}, ${formData.city}`;

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        total,
        phone_number: formData.phone || null,
        shipping_address: address,
        status: "pending",
      })
      .select("id")
      .single();

    if (orderError) throw new Error(`Order failed: ${orderError.message}`);

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image || "",
      quantity: item.quantity,
      unit_price: item.product_price,
      total_price: item.product_price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw new Error(`Order items failed: ${itemsError.message}`);

    // Clear cart
    await supabase.from("cart_items").delete().eq("user_id", userId);

    return order.id;
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast({ title: "Cart is empty", variant: "destructive" });
      return;
    }

    setPlacing(true);

    try {
      if (isGuest) {
        try {
          checkoutSchema.parse(formData);
        } catch (error) {
          if (error instanceof z.ZodError) {
            toast({ title: "Validation Error", description: error.errors[0].message, variant: "destructive" });
            setPlacing(false);
            return;
          }
        }

        // Register user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: `${formData.phone}@freshmart.local`,
          password: formData.password,
          options: {
            data: {
              username: `${formData.firstName} ${formData.lastName}`,
              phone_number: formData.phone,
            },
          },
        });

        if (authError) {
          toast({ title: "Registration failed", description: authError.message, variant: "destructive" });
          setPlacing(false);
          return;
        }

        if (authData.user) {
          // Migrate guest cart to DB
          const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
          for (const item of guestCart) {
            await supabase.from("cart_items").insert({
              user_id: authData.user.id,
              product_id: item.product_id,
              product_name: item.product_name,
              product_price: item.product_price,
              product_image: item.product_image || "",
              quantity: item.quantity,
            });
          }
          localStorage.removeItem("guestCart");

          // Re-fetch cart from DB for the order
          const { data: dbCart } = await supabase
            .from("cart_items")
            .select("*")
            .eq("user_id", authData.user.id);

          if (dbCart) setCartItems(dbCart as CartItem[]);

          await createOrder(authData.user.id);
        }
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({ title: "Please log in", variant: "destructive" });
          setPlacing(false);
          return;
        }
        await createOrder(user.id);
      }

      toast({
        title: "Order placed successfully! 🎉",
        description: "You will be contacted for delivery.",
      });
      navigate("/shop");
    } catch (err: any) {
      toast({ title: "Order failed", description: err.message, variant: "destructive" });
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background"><Header cartItemCount={0} /></div>;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Header cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} />

      <main className="container px-4 sm:px-6 py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
                {isGuest ? "Create Account & Shipping Info" : "Shipping Information"}
              </h2>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                </div>
                {isGuest && (
                  <>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="07XXXXXXXX" value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="password">Create Password</Label>
                      <Input id="password" type="password" placeholder="Min 6 characters" value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="KG 123 St" value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Kigali" value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={(v) => setFormData({ ...formData, country: v })}>
                      <SelectTrigger id="country"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rw">Rwanda</SelectItem>
                        <SelectItem value="bi">Burundi</SelectItem>
                        <SelectItem value="cd">DR Congo</SelectItem>
                        <SelectItem value="ug">Uganda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-4 sm:p-6 sticky top-24">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">{item.product_name} (x{item.quantity})</span>
                    <span className="flex-shrink-0">{(item.product_price * item.quantity).toLocaleString()} FRw</span>
                  </div>
                ))}
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Subtotal</span>
                    <span>{subtotal.toLocaleString()} FRw</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `${shipping.toLocaleString()} FRw`}</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg font-bold pt-2">
                    <span>Total</span>
                    <span className="text-primary">{total.toLocaleString()} FRw</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={placing || cartItems.length === 0}>
                {placing ? "Placing Order..." : "Place Order"}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                By placing your order, you agree to our <Link to="/terms" className="underline">terms</Link> and <Link to="/privacy" className="underline">privacy policy</Link>
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
