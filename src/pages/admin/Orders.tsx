import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronUp, Package, MapPin, CreditCard, Eye } from "lucide-react";
import { format } from "date-fns";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  pricing_type?: "retail" | "wholesale";
}

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  phone_number: string | null;
  shipping_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_type?: "retail" | "wholesale" | "mixed";
}

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "outline",
  confirmed: "secondary",
  processing: "secondary",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const orderTypeColors: Record<string, "default" | "secondary" | "outline"> = {
  retail: "secondary",
  wholesale: "default",
  mixed: "outline",
};

const Orders = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | "retail" | "wholesale" | "mixed">("all");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  const { data: orderItems = [] } = useQuery({
    queryKey: ["admin-order-items", selectedOrder?.id],
    enabled: !!selectedOrder,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", selectedOrder!.id);
      if (error) throw error;
      return data as OrderItem[];
    },
  });

  const { data: payment } = useQuery({
    queryKey: ["admin-order-payment", selectedOrder?.id],
    enabled: !!selectedOrder,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("order_id", selectedOrder!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: customerProfile } = useQuery({
    queryKey: ["admin-order-customer", selectedOrder?.user_id],
    enabled: !!selectedOrder?.user_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, phone_number")
        .eq("user_id", selectedOrder!.user_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update order status"),
  });

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Order Management</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              All Orders ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Phone</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {format(new Date(order.created_at), "MMM d, yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="font-semibold text-sm">
                          {Number(order.total).toLocaleString()} FRw
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              updateStatusMutation.mutate({ orderId: order.id, status: value })
                            }
                          >
                            <SelectTrigger className="w-[120px] h-8 text-xs">
                              <Badge variant={statusColors[order.status] || "outline"} className="text-[10px]">
                                {order.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((s) => (
                                <SelectItem key={s} value={s} className="capitalize">
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {order.phone_number || "—"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openDetail(order)}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-5">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" /> Customer & Shipping
                  </h3>
                  <div className="text-sm space-y-1 bg-muted/50 rounded-lg p-3">
                    <p><span className="text-muted-foreground">Name:</span> {customerProfile?.username || "—"}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.phone_number || customerProfile?.phone_number || "—"}</p>
                    <p><span className="text-muted-foreground">Address:</span> {selectedOrder.shipping_address || "—"}</p>
                    <p><span className="text-muted-foreground">Ordered:</span> {format(new Date(selectedOrder.created_at), "PPpp")}</p>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h3 className="font-semibold text-sm mb-2">Items</h3>
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-muted/50 rounded-lg p-2">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-10 h-10 rounded object-cover flex-shrink-0"
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
                </div>

                {/* Payment State */}
                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-primary" /> Payment
                  </h3>
                  <div className="text-sm space-y-1 bg-muted/50 rounded-lg p-3">
                    {payment ? (
                      <>
                        <p><span className="text-muted-foreground">Method:</span> {payment.method}</p>
                        <p><span className="text-muted-foreground">Amount:</span> {Number(payment.amount).toLocaleString()} FRw</p>
                        <p>
                          <span className="text-muted-foreground">Status:</span>{" "}
                          <Badge variant={payment.status === "completed" ? "default" : "outline"} className="text-[10px]">
                            {payment.status}
                          </Badge>
                        </p>
                        {payment.transaction_ref && (
                          <p><span className="text-muted-foreground">Ref:</span> {payment.transaction_ref}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground">No payment recorded yet</p>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="font-bold">Total</span>
                  <span className="text-lg font-bold text-primary">
                    {Number(selectedOrder.total).toLocaleString()} FRw
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Orders;
