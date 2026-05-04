import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Package, ShoppingBag, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  total: number;
  status: string;
  shipping_address: string | null;
  phone_number: string | null;
  created_at: string;
}

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      const [orderRes, itemsRes] = await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).single(),
        supabase.from("order_items").select("*").eq("order_id", orderId),
      ]);

      if (orderRes.data) setOrder(orderRes.data as Order);
      if (itemsRes.data) setItems(itemsRes.data as OrderItem[]);
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  const subtotal = items.reduce((s, i) => s + Number(i.total_price), 0);
  const shipping = order ? Number(order.total) - subtotal : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemCount={0} />
        <main className="container px-4 py-12 max-w-lg mx-auto space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemCount={0} />
        <main className="container px-4 py-12 text-center">
          <p className="text-xl text-muted-foreground mb-4">Order not found</p>
          <Link to="/shop"><Button>Go to Shop</Button></Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      <Header cartItemCount={0} />

      <main className="container px-4 py-6 sm:py-10 max-w-lg mx-auto">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Order Confirmed!</h1>
          <p className="text-muted-foreground">Thank you for shopping with WellarShop</p>
        </div>

        {/* Order Number */}
        <Card className="p-4 sm:p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Order Number</p>
              <p className="font-mono font-bold text-lg">{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <Badge variant="outline" className="capitalize">{order.status}</Badge>
          </div>

          <Separator className="mb-4" />

          {/* Items */}
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
            <Package className="h-4 w-4" /> Items Ordered
          </h3>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Number(item.unit_price).toLocaleString()} FRw × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold flex-shrink-0">
                  {Number(item.total_price).toLocaleString()} FRw
                </p>
              </div>
            ))}
          </div>

          <Separator className="mb-4" />

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{subtotal.toLocaleString()} FRw</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{shipping <= 0 ? "Free" : `${shipping.toLocaleString()} FRw`}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">{Number(order.total).toLocaleString()} FRw</span>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-4 sm:p-6 mb-4 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2">What's Next?</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              We'll contact you at <strong className="text-foreground">{order.phone_number || "your phone"}</strong> to confirm delivery details.
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              Your order will be delivered to <strong className="text-foreground">{order.shipping_address || "your address"}</strong>.
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              Track your order status anytime from your <Link to="/orders" className="text-primary underline">order history</Link>.
            </li>
          </ul>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link to="/orders">
            <Button className="w-full" variant="outline">
              View Order History
            </Button>
          </Link>
          <Link to="/shop">
            <Button className="w-full">
              <ShoppingBag className="h-4 w-4 mr-2" /> Continue Shopping
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;
