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
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postal: z.string().min(1, "Postal code is required"),
});

interface CartItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
}

const Checkout = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    city: "",
    postal: "",
    country: "uk",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Guest user - load from localStorage
        setIsGuest(true);
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        setCartItems(guestCart.map((item: any, index: number) => ({ ...item, id: `guest-${index}` })));
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id);

      if (data) {
        setCartItems(data);
      }
      setLoading(false);
    };

    fetchCart();
  }, [navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
  const shipping = 9.99;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (isGuest) {
      // Validate form
      try {
        checkoutSchema.parse(formData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({
            title: "Validation Error",
            description: error.errors[0].message,
            variant: "destructive",
          });
          return;
        }
      }

      // Register user with their info
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
        toast({
          title: "Registration failed",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (authData.user) {
        // Migrate guest cart to database
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        for (const item of guestCart) {
          await supabase.from("cart_items").insert({
            user_id: authData.user.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_price: item.product_price,
            product_image: item.product_image,
            quantity: item.quantity,
          });
        }
        
        // Clear guest cart
        localStorage.removeItem("guestCart");
        
        // Clear cart after order
        await supabase.from("cart_items").delete().eq("user_id", authData.user.id);
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Clear cart after order
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    }
    
    toast({
      title: "Order placed successfully!",
      description: "Your account has been created and order confirmed.",
    });
    
    navigate("/shop");
  };

  if (loading) return <div className="min-h-screen bg-background"><Header cartItemCount={0} /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} />
      
      <main className="container py-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {isGuest ? "Create Account & Shipping Info" : "Shipping Information"}
              </h2>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                {isGuest && (
                  <>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="1234567890"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Create Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    placeholder="123 Main St"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      placeholder="London"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal">Postal Code</Label>
                    <Input 
                      id="postal" 
                      placeholder="SW1A 1AA"
                      value={formData.postal}
                      onChange={(e) => setFormData({...formData, postal: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Payment Method</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.product_name} (x{item.quantity})</span>
                    <span>${(item.product_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handlePlaceOrder}>
                Place Order
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
