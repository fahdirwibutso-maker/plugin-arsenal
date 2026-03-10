import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";

const WholesaleApplications = () => {
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["admin-wholesale-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wholesale_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch usernames for each application
      const userIds = [...new Set(data.map((a: any) => a.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, phone_number")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      return data.map((app: any) => ({
        ...app,
        profile: profileMap.get(app.user_id) || { username: "Unknown", phone_number: "" },
      }));
    },
  });

  const handleApplication = useMutation({
    mutationFn: async ({ id, userId, status }: { id: string; userId: string; status: string }) => {
      // Update application status
      const { error: appError } = await supabase
        .from("wholesale_applications")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (appError) throw appError;

      // If approved, set user as wholesale
      if (status === "approved") {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ is_wholesale: true })
          .eq("user_id", userId);
        if (profileError) throw profileError;
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-wholesale-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`Application ${status}!`);
    },
    onError: () => {
      toast.error("Failed to update application");
    },
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="text-yellow-600 border-yellow-500/30 bg-yellow-500/10 text-[10px]">Pending</Badge>;
      case "approved": return <Badge variant="outline" className="text-green-600 border-green-500/30 bg-green-500/10 text-[10px]">Approved</Badge>;
      case "rejected": return <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 text-[10px]">Rejected</Badge>;
      default: return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">Wholesale Applications</h1>

        <Card>
          <CardHeader>
            <CardTitle>All Applications</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden sm:table-cell">Business</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                  </TableRow>
                ) : applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No applications yet</TableCell>
                  </TableRow>
                ) : (
                  applications.map((app: any) => (
                    <TableRow key={app.id}>
                      <TableCell className="text-xs sm:text-sm">
                        <div>
                          <p className="font-medium">{app.profile.username}</p>
                          <p className="text-muted-foreground text-[10px]">{app.profile.phone_number}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{app.business_name}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{app.business_type}</TableCell>
                      <TableCell>{statusBadge(app.status)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {app.status === "pending" ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-green-600 hover:bg-green-500/10"
                              onClick={() => handleApplication.mutate({ id: app.id, userId: app.user_id, status: "approved" })}
                              disabled={handleApplication.isPending}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-destructive hover:bg-destructive/10"
                              onClick={() => handleApplication.mutate({ id: app.id, userId: app.user_id, status: "rejected" })}
                              disabled={handleApplication.isPending}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default WholesaleApplications;
