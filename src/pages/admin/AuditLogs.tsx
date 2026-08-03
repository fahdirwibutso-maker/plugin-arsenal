import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollText } from "lucide-react";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  description: string | null;
  metadata: unknown;
  created_at: string;
}

const AuditLogs = () => {
  const [search, setSearch] = useState("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  const { data: actors = {} } = useQuery({
    queryKey: ["admin-audit-actors", logs.length],
    enabled: logs.length > 0,
    queryFn: async () => {
      const ids = [...new Set(logs.map((l) => l.user_id))];
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", ids);
      if (error) throw error;
      return Object.fromEntries((data || []).map((p) => [p.user_id, p.username]));
    },
  });

  const filtered = logs.filter((log) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      log.action.toLowerCase().includes(q) ||
      log.entity_type.toLowerCase().includes(q) ||
      (log.entity_id || "").toLowerCase().includes(q) ||
      (log.description || "").toLowerCase().includes(q) ||
      (actors[log.user_id] || "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ScrollText className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Audit Log</h1>
            <p className="text-sm text-muted-foreground">
              Every admin action, with the acting user and timestamp.
            </p>
          </div>
        </div>

        <Input
          placeholder="Search by action, user, entity or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        <Card className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Performed by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Loading audit log...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No audit entries yet.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {log.action.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="capitalize">{log.entity_type}</div>
                    {log.entity_id && (
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {log.entity_id.slice(0, 8)}...
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs max-w-[280px]">
                    {log.description || "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>{actors[log.user_id] || "Unknown"}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {log.user_id.slice(0, 8)}...
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AuditLogs;
