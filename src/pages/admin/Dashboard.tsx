import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, Banknote } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { data: productCount = 0, isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-product-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: orderStats = { count: 0, revenue: 0 }, isLoading: loadingOrders } = useQuery({
    queryKey: ["admin-order-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("id, total");
      if (error) throw error;
      return {
        count: data.length,
        revenue: data.reduce((sum, o) => sum + Number(o.total), 0),
      };
    },
  });

  const { data: userCount = 0, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-user-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: recentOrders = [], isLoading: loadingRecent } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total, status, created_at, phone_number")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: lowStockProducts = [], isLoading: loadingLowStock } = useQuery({
    queryKey: ["admin-low-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, stock")
        .eq("is_active", true)
        .lte("stock", 20)
        .order("stock", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const isLoading = loadingProducts || loadingOrders || loadingUsers;

  const stats = [
    { title: "Total Users", value: userCount.toLocaleString(), icon: Users, color: "text-blue-600" },
    { title: "Products", value: productCount.toLocaleString(), icon: Package, color: "text-green-600" },
    { title: "Orders", value: orderStats.count.toLocaleString(), icon: ShoppingCart, color: "text-purple-600" },
    { title: "Revenue", value: `${orderStats.revenue.toLocaleString()} FRw`, icon: Banknote, color: "text-yellow-600" },
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRecent ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b border-border pb-2">
                      <div>
                        <p className="font-medium text-sm">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()} • {order.status}
                        </p>
                      </div>
                      <span className="text-primary font-semibold text-sm">{Number(order.total).toLocaleString()} FRw</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingLowStock ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">All products well stocked</p>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between border-b border-border pb-2">
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <span className="text-destructive font-semibold text-sm">{product.stock} left</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;