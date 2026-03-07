import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function useOrderNotifications() {
  useEffect(() => {
    let userId: string | null = null;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userId = user.id;

      const channel = supabase
        .channel("order-status-updates")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const oldStatus = (payload.old as any)?.status;
            const newStatus = (payload.new as any)?.status;
            if (oldStatus && newStatus && oldStatus !== newStatus) {
              const label = statusLabels[newStatus] || newStatus;
              toast.info(`Order status updated to "${label}"`, {
                description: `Your order has been updated.`,
                duration: 6000,
              });
            }
          }
        )
        .subscribe();

      return channel;
    };

    let channelRef: ReturnType<typeof supabase.channel> | undefined;
    setup().then((ch) => { channelRef = ch; });

    return () => {
      if (channelRef) {
        supabase.removeChannel(channelRef);
      }
    };
  }, []);
}
