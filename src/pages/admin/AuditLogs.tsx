import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollText, FilterX } from "lucide-react";

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

const localDateKey = (iso: string) => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const AuditLogs = () => {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [entityIdFilter, setEntityIdFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const actionOptions = useMemo(
    () => [...new Set(logs.map((l) => l.action))].sort(),
    [logs]
  );

  const userOptions = useMemo(() => {
    const seen = new Set<string>();
    return logs
      .map((l) => l.user_id)
      .filter((id) => {
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map((id) => ({ id, name: actors[id] || "Unknown" }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [logs, actors]);

  const filtered = logs.filter((log) => {
    const q = search.trim().toLowerCase();
    if (
      q &&
      !(
        log.action.toLowerCase().includes(q) ||
        log.entity_type.toLowerCase().includes(q) ||
        (log.entity_id || "").toLowerCase().includes(q) ||
        (log.description || "").toLowerCase().includes(q) ||
        (actors[log.user_id] || "").toLowerCase().includes(q)
      )
    )
      return false;

    if (actionFilter !== "all" && log.action !== actionFilter) return false;
    if (userFilter !== "all" && log.user_id !== userFilter) return false;

    if (entityIdFilter.trim()) {
      const idQuery = entityIdFilter.trim().toLowerCase();
      if (!(log.entity_id || "").toLowerCase().includes(idQuery)) return false;
    }

    const logDate = localDateKey(log.created_at);
    if (startDate && logDate < startDate) return false;
    if (endDate && logDate > endDate) return false;

    return true;
  });

  const hasActiveFilters =
    actionFilter !== "all" ||
    userFilter !== "all" ||
    entityIdFilter.trim() !== "" ||
    startDate !== "" ||
    endDate !== "" ||
    search.trim() !== "";

  const clearFilters = () => {
    setActionFilter("all");
    setUserFilter("all");
    setEntityIdFilter("");
    setStartDate("");
    setEndDate("");
    setSearch("");
  };

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

        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Action</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {actionOptions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Acting user</label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {userOptions.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">From date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">To date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Order / plugin ID
              </label>
              <Input
                placeholder="Paste entity ID..."
                value={entityIdFilter}
                onChange={(e) => setEntityIdFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Free text search (action, user, details)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <FilterX className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {filtered.length} of {logs.length} entries
            </span>
          </div>
        </Card>

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
                    No audit entries match your filters.
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
