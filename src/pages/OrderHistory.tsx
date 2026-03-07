import Header from "@/components/Header";
import { useCartCount } from "@/hooks/useCartCount";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  items?: OrderItem[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  processing: "bg-purple-100 text-purple-800 border-purple-300",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { count } = useCartCount();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersData) {
        setOrders(ordersData as Order[]);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [navigate]);

  const loadOrderItems = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (data) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, items: data as OrderItem[] } : o))
      );
    }
    setExpandedOrder(orderId);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Header cartItemCount={count} />

      <main className="container px-4 sm:px-6 py-4 sm:py-6 md:py-8">
        <div className="flex items-center gap-3 mb-6">
          <Package className="h-7 w-7 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Orders</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-4">Start shopping to see your orders here.</p>
            <Button onClick={() => navigate("/shop")}>Browse Products</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <button
                  className="w-full p-4 sm:p-6 text-left"
                  onClick={() => loadOrderItems(order.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                      <p className="font-semibold text-foreground text-lg">
                        {order.total.toLocaleString()} FRw
                      </p>
                      {order.shipping_address && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          📍 {order.shipping_address}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`capitalize ${statusColors[order.status] || "bg-muted text-muted-foreground"}`}
                      >
                        {order.status}
                      </Badge>
                      {expandedOrder === order.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </button>

                {expandedOrder === order.id && order.items && (
                  <div className="border-t border-border px-4 sm:px-6 py-4 bg-muted/30">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-12 h-12 rounded-md object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">
                              {item.product_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} × {item.unit_price.toLocaleString()} FRw
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            {item.total_price.toLocaleString()} FRw
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderHistory;
