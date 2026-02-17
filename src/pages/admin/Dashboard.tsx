import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, Banknote } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";

const Dashboard = () => {
  const stats = [
    { title: "Total Users", value: "1,234", icon: Users, color: "text-blue-600" },
    { title: "Products", value: "567", icon: Package, color: "text-green-600" },
    { title: "Orders", value: "890", icon: ShoppingCart, color: "text-purple-600" },
    { title: "Revenue", value: "45,678 FRw", icon: Banknote, color: "text-yellow-600" },
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
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
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">Order #{1000 + i}</p>
                      <p className="text-sm text-muted-foreground">Customer {i}</p>
                    </div>
                    <span className="text-green-600 font-semibold">{(i * 50).toFixed(0)} FRw</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">Product {i}</p>
                      <p className="text-sm text-muted-foreground">Category {i}</p>
                    </div>
                    <span className="text-red-600 font-semibold">{i * 5} left</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
