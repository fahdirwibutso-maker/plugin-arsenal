import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const expenseCategories = [
  "Rent", "Salaries", "Utilities", "Supplies", "Transport",
  "Marketing", "Maintenance", "Insurance", "Taxes", "Other",
];

const Accounting = () => {
  const queryClient = useQueryClient();
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState("30");

  const startDate = useMemo(() => {
    if (dateRange === "7") return subDays(new Date(), 7);
    if (dateRange === "30") return subDays(new Date(), 30);
    if (dateRange === "90") return subDays(new Date(), 90);
    return subDays(new Date(), 365);
  }, [dateRange]);

  // Fetch orders for revenue
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["accounting-orders", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch payments
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["accounting-payments", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch expenses
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ["accounting-expenses", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .gte("expense_date", format(startDate, "yyyy-MM-dd"))
        .order("expense_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Computed metrics
  const totalRevenue = useMemo(
    () => orders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + Number(o.total), 0),
    [orders]
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses]
  );
  const netProfit = totalRevenue - totalExpenses;
  const completedPayments = useMemo(
    () => payments.filter(p => p.status === "completed").reduce((sum, p) => sum + Number(p.amount), 0),
    [payments]
  );

  // Revenue chart data - group by day
  const revenueChartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    orders.filter(o => o.status !== "cancelled").forEach(o => {
      const day = format(new Date(o.created_at), "MMM dd");
      grouped[day] = (grouped[day] || 0) + Number(o.total);
    });
    return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue })).reverse();
  }, [orders]);

  // Expense by category
  const expenseByCategoryData = useMemo(() => {
    const grouped: Record<string, number> = {};
    expenses.forEach(e => {
      grouped[e.category] = (grouped[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(grouped).map(([category, amount]) => ({ category, amount }));
  }, [expenses]);

  // Save expense mutation
  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const expenseData = {
        category: formData.get("category") as string,
        description: formData.get("description") as string,
        amount: parseFloat(formData.get("amount") as string),
        expense_date: formData.get("expense_date") as string,
      };
      if (editingExpense) {
        const { error } = await supabase.from("expenses").update(expenseData).eq("id", editingExpense.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("expenses").insert(expenseData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting-expenses"] });
      toast.success(editingExpense ? "Expense updated" : "Expense added");
      resetDialog();
    },
    onError: (err: any) => toast.error(err.message || "Failed to save expense"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting-expenses"] });
      toast.success("Expense deleted");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete"),
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveMutation.mutate(new FormData(e.currentTarget));
  };

  const resetDialog = () => {
    setEditingExpense(null);
    setIsDialogOpen(false);
  };

  const isLoading = ordersLoading || paymentsLoading || expensesLoading;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold">Accounting</h1>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-7 w-24" /> : (
                <p className="text-lg sm:text-2xl font-bold">{totalRevenue.toLocaleString()} <span className="text-xs text-muted-foreground">FRw</span></p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-7 w-24" /> : (
                <p className="text-lg sm:text-2xl font-bold">{totalExpenses.toLocaleString()} <span className="text-xs text-muted-foreground">FRw</span></p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-7 w-24" /> : (
                <p className={`text-lg sm:text-2xl font-bold ${netProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {netProfit.toLocaleString()} <span className="text-xs text-muted-foreground">FRw</span>
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Collected</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-7 w-24" /> : (
                <p className="text-lg sm:text-2xl font-bold">{completedPayments.toLocaleString()} <span className="text-xs text-muted-foreground">FRw</span></p>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue" className="text-xs sm:text-sm">Revenue</TabsTrigger>
            <TabsTrigger value="expenses" className="text-xs sm:text-sm">Expenses</TabsTrigger>
            <TabsTrigger value="payments" className="text-xs sm:text-sm">Payments</TabsTrigger>
            <TabsTrigger value="pnl" className="text-xs sm:text-sm">P&L</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-64 w-full" /> : revenueChartData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No revenue data for this period</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: number) => [`${value.toLocaleString()} FRw`, "Revenue"]} />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Expense Records</h2>
              <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetDialog(); else setIsDialogOpen(true); }}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => { setEditingExpense(null); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" defaultValue={editingExpense?.category || expenseCategories[0]}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" name="description" defaultValue={editingExpense?.description || ""} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Amount (FRw)</Label>
                        <Input id="amount" name="amount" type="number" min="0" step="1" defaultValue={editingExpense?.amount} required />
                      </div>
                      <div>
                        <Label htmlFor="expense_date">Date</Label>
                        <Input id="expense_date" name="expense_date" type="date" defaultValue={editingExpense?.expense_date || format(new Date(), "yyyy-MM-dd")} required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                      {saveMutation.isPending ? "Saving..." : editingExpense ? "Update" : "Add Expense"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Expense by category chart */}
            {expenseByCategoryData.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Expenses by Category</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={expenseByCategoryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip formatter={(value: number) => [`${value.toLocaleString()} FRw`, "Amount"]} />
                      <Bar dataKey="amount" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="overflow-x-auto pt-4">
                {expensesLoading ? (
                  <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                ) : expenses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No expenses recorded</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((exp: any) => (
                        <TableRow key={exp.id}>
                          <TableCell className="text-xs">{format(parseISO(exp.expense_date), "MMM dd, yyyy")}</TableCell>
                          <TableCell><Badge variant="secondary" className="text-xs">{exp.category}</Badge></TableCell>
                          <TableCell className="max-w-[150px] truncate text-sm">{exp.description}</TableCell>
                          <TableCell className="font-medium">{Number(exp.amount).toLocaleString()} FRw</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => { setEditingExpense(exp); setIsDialogOpen(true); }}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => { if (confirm("Delete this expense?")) deleteMutation.mutate(exp.id); }} disabled={deleteMutation.isPending}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader><CardTitle>Payment Records</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                {paymentsLoading ? (
                  <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                ) : payments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No payments for this period</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ref</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((p: any) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-xs">{format(new Date(p.created_at), "MMM dd, HH:mm")}</TableCell>
                          <TableCell className="text-xs font-mono">{p.order_id.slice(0, 8)}…</TableCell>
                          <TableCell className="capitalize">{p.method}</TableCell>
                          <TableCell className="font-medium">{Number(p.amount).toLocaleString()} FRw</TableCell>
                          <TableCell>
                            <Badge variant={p.status === "completed" ? "default" : p.status === "pending" ? "secondary" : "destructive"} className="text-xs">
                              {p.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{p.transaction_ref || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* P&L Tab */}
          <TabsContent value="pnl">
            <Card>
              <CardHeader><CardTitle>Profit & Loss Summary</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Total Revenue</span>
                    <span className="text-green-500 font-bold">{totalRevenue.toLocaleString()} FRw</span>
                  </div>
                  
                  {expenseByCategoryData.map(({ category, amount }) => (
                    <div key={category} className="flex justify-between items-center py-1 pl-4 text-sm">
                      <span className="text-muted-foreground">{category}</span>
                      <span className="text-red-500">-{amount.toLocaleString()} FRw</span>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center py-2 border-t">
                    <span className="text-muted-foreground font-medium">Total Expenses</span>
                    <span className="text-red-500 font-bold">-{totalExpenses.toLocaleString()} FRw</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-t-2 border-primary">
                    <span className="text-lg font-bold">Net Profit / Loss</span>
                    <span className={`text-xl font-bold ${netProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {netProfit >= 0 ? "+" : ""}{netProfit.toLocaleString()} FRw
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-4">
                  Based on data from the last {dateRange} days • Orders marked as "cancelled" are excluded
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Accounting;
