import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "wholesale_application" | "order_update";
  title: string;
  description: string;
  timestamp: string;
  link: string;
}

export function AdminNotifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState<string>(() =>
    localStorage.getItem("admin-notif-last-seen") || new Date(0).toISOString()
  );

  // Fetch recent wholesale applications
  const { data: wholesaleApps = [] } = useQuery({
    queryKey: ["admin-notif-wholesale"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wholesale_applications")
        .select("id, user_id, business_name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;

      const userIds = [...new Set(data.map((a) => a.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p.username]));

      return data.map((app) => ({
        id: `ws-${app.id}`,
        type: "wholesale_application" as const,
        title: app.status === "pending" ? "New Wholesale Application" : `Application ${app.status}`,
        description: `${profileMap.get(app.user_id) || "User"} — ${app.business_name}`,
        timestamp: app.created_at,
        link: "/admin/wholesale-applications",
      }));
    },
    refetchInterval: 30000,
  });

  // Fetch recent orders
  const { data: recentOrders = [] } = useQuery({
    queryKey: ["admin-notif-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(10);
      if (error) throw error;

      return data.map((order) => ({
        id: `ord-${order.id}`,
        type: "order_update" as const,
        title: order.status === "pending" ? "New Order" : `Order ${order.status}`,
        description: `FRw ${Number(order.total).toLocaleString()} — ${order.status}`,
        timestamp: order.updated_at || order.created_at,
        link: "/admin/orders",
      }));
    },
    refetchInterval: 30000,
  });

  // Realtime subscriptions
  useEffect(() => {
    const wsChannel = supabase
      .channel("admin-notif-ws-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "wholesale_applications" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-notif-wholesale"] });
      })
      .subscribe();

    const orderChannel = supabase
      .channel("admin-notif-order-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-notif-orders"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(wsChannel);
      supabase.removeChannel(orderChannel);
    };
  }, [queryClient]);

  const notifications: Notification[] = [...wholesaleApps, ...recentOrders]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15);

  const unreadCount = notifications.filter((n) => n.timestamp > lastSeen).length;

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      const now = new Date().toISOString();
      setLastSeen(now);
      localStorage.setItem("admin-notif-last-seen", now);
    }
  };

  const handleClick = (link: string) => {
    setOpen(false);
    navigate(link);
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">No notifications yet</p>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => {
                const isUnread = n.timestamp > lastSeen;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n.link)}
                    className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                      isUnread ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isUnread && (
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                      <div className={isUnread ? "" : "pl-4"}>
                        <p className="text-xs font-medium">{n.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{n.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
