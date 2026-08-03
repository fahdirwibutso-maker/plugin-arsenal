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
import { logAudit } from "@/lib/audit";
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
        .select("username, phone_number, is_wholesale, created_at")
        .eq("user_id", selectedOrder!.user_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const previous = orders.find((o) => o.id === orderId)?.status;
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);
      if (error) throw error;
      await logAudit({
        action: "order_status_updated",
        entityType: "order",
        entityId: orderId,
        description: `Order status changed from "${previous ?? "unknown"}" to "${status}"`,
        metadata: { from: previous ?? null, to: status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                All Orders ({orders.filter((o) => typeFilter === "all" || (o.order_type || "retail") === typeFilter).length})
              </CardTitle>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "retail", "wholesale", "mixed"] as const).map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={typeFilter === t ? "default" : "outline"}
                    className="h-7 px-2.5 text-xs capitalize"
                    onClick={() => setTypeFilter(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
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
                      <TableHead>Type</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Phone</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders
                      .filter((o) => typeFilter === "all" || (o.order_type || "retail") === typeFilter)
                      .map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {format(new Date(order.created_at), "MMM d, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={orderTypeColors[order.order_type || "retail"]} className="text-[10px] capitalize">
                            {order.order_type || "retail"}
                          </Badge>
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
              <DialogTitle className="flex items-center gap-2 flex-wrap">
                <Package className="h-5 w-5" />
                <span>Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}</span>
                {selectedOrder?.order_type && (
                  <Badge variant={orderTypeColors[selectedOrder.order_type]} className="text-[10px] capitalize">
                    {selectedOrder.order_type}
                  </Badge>
                )}
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
                    <p className="flex items-center gap-2 flex-wrap">
                      <span className="text-muted-foreground">Name:</span> {customerProfile?.username || "—"}
                      {customerProfile?.is_wholesale && (
                        <Badge variant="default" className="text-[10px]">Wholesale</Badge>
                      )}
                    </p>
                    <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.phone_number || customerProfile?.phone_number || "—"}</p>
                    <p><span className="text-muted-foreground">Address:</span> {selectedOrder.shipping_address || "—"}</p>
                    <p className="font-mono text-xs"><span className="text-muted-foreground font-sans">Customer ID:</span> {selectedOrder.user_id?.slice(0, 8).toUpperCase() || "Guest"}</p>
                    {customerProfile?.created_at && (
                      <p><span className="text-muted-foreground">Member since:</span> {format(new Date(customerProfile.created_at), "PP")}</p>
                    )}
                    <p><span className="text-muted-foreground">Ordered:</span> {format(new Date(selectedOrder.created_at), "PPpp")}</p>
                    {selectedOrder.notes && (
                      <p><span className="text-muted-foreground">Notes:</span> {selectedOrder.notes}</p>
                    )}
                  </div>
                </div>

                {/* Update Status */}
                <div>
                  <h3 className="font-semibold text-sm mb-2">Update Order Status</h3>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => {
                      updateStatusMutation.mutate({ orderId: selectedOrder.id, status: value });
                      setSelectedOrder({ ...selectedOrder, status: value });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <Badge variant={statusColors[selectedOrder.status] || "outline"} className="text-xs capitalize">
                        {selectedOrder.status}
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
                </div>

                {/* Line Items */}
                <div>
                  <h3 className="font-semibold text-sm mb-2">Items</h3>
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Product</TableHead>
                          <TableHead className="text-xs">Type</TableHead>
                          <TableHead className="text-xs text-right">Unit × Qty</TableHead>
                          <TableHead className="text-xs text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={item.product_image}
                                  alt={item.product_name}
                                  className="w-9 h-9 rounded object-cover flex-shrink-0"
                                />
                                <span className="text-sm font-medium truncate">{item.product_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={item.pricing_type === "wholesale" ? "default" : "secondary"}
                                className="text-[10px] capitalize"
                              >
                                {item.pricing_type || "retail"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                              {Number(item.unit_price).toLocaleString()} × {item.quantity}
                            </TableCell>
                            <TableCell className="text-right text-sm font-semibold whitespace-nowrap">
                              {Number(item.total_price).toLocaleString()} FRw
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Totals by pricing type (when mixed) */}
                {(() => {
                  const retailTotal = orderItems
                    .filter((i) => (i.pricing_type || "retail") === "retail")
                    .reduce((s, i) => s + Number(i.total_price), 0);
                  const wholesaleTotal = orderItems
                    .filter((i) => i.pricing_type === "wholesale")
                    .reduce((s, i) => s + Number(i.total_price), 0);
                  const hasBoth = retailTotal > 0 && wholesaleTotal > 0;
                  if (!hasBoth) return null;
                  return (
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Totals by Pricing Type</h3>
                      <div className="text-sm space-y-1.5 bg-muted/50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">Retail</Badge>
                          </span>
                          <span className="font-semibold">{retailTotal.toLocaleString()} FRw</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <Badge variant="default" className="text-[10px]">Wholesale</Badge>
                          </span>
                          <span className="font-semibold">{wholesaleTotal.toLocaleString()} FRw</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

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
