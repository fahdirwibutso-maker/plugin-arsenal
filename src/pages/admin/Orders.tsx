import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Orders = () => {
  const [retailOrders] = useState([
    { id: 1001, customer: "John Doe", items: 3, total: 125.99, status: "Pending", date: "2024-01-15" },
    { id: 1002, customer: "Jane Smith", items: 2, total: 89.99, status: "Completed", date: "2024-01-14" },
    { id: 1003, customer: "Bob Wilson", items: 5, total: 234.50, status: "Shipping", date: "2024-01-13" },
  ]);

  const [wholesaleOrders] = useState([
    { id: 2001, customer: "ABC Store", items: 50, total: 2500.00, status: "Pending", date: "2024-01-15" },
    { id: 2002, customer: "XYZ Market", items: 75, total: 3750.00, status: "Completed", date: "2024-01-12" },
    { id: 2003, customer: "Quick Shop", items: 100, total: 5000.00, status: "Processing", date: "2024-01-10" },
  ]);

  const updateStatus = (orderId: number, type: string) => {
    toast.success(`${type} order #${orderId} status updated`);
  };

  const OrderTable = ({ orders, type }: { orders: any[]; type: string }) => (
    <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="hidden sm:table-cell">Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium text-xs sm:text-sm">#{order.id}</TableCell>
            <TableCell className="text-xs sm:text-sm">{order.customer}</TableCell>
            <TableCell className="hidden sm:table-cell">{order.items}</TableCell>
            <TableCell className="text-xs sm:text-sm">{order.total.toFixed(0)} FRw</TableCell>
            <TableCell>
              <Badge
                variant={
                  order.status === "Completed"
                    ? "default"
                    : order.status === "Pending"
                    ? "outline"
                    : "secondary"
                }
              >
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">{order.date}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => updateStatus(order.id, type)}>
                Update
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Order Management</h1>

        <Tabs defaultValue="retail" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="retail">Retail Orders</TabsTrigger>
            <TabsTrigger value="wholesale">Wholesale Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="retail">
            <Card>
              <CardHeader>
                <CardTitle>Retail Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTable orders={retailOrders} type="Retail" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wholesale">
            <Card>
              <CardHeader>
                <CardTitle>Wholesale Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTable orders={wholesaleOrders} type="Wholesale" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Orders;
