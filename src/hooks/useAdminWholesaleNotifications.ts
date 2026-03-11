import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAdminWholesaleNotifications() {
  useEffect(() => {
    let isAdmin = false;
    let channelRef: ReturnType<typeof supabase.channel> | undefined;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if current user is admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) return;
      isAdmin = true;

      const channel = supabase
        .channel("admin-wholesale-notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "wholesale_applications",
          },
          async (payload) => {
            const app = payload.new as any;
            // Fetch the applicant's profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("username")
              .eq("user_id", app.user_id)
              .maybeSingle();

            const name = profile?.username || "A user";
            toast.info(`New Wholesale Application`, {
              description: `${name} applied for wholesale access (${app.business_name})`,
              duration: 8000,
              action: {
                label: "Review",
                onClick: () => {
                  window.location.href = "/admin/wholesale-applications";
                },
              },
            });
          }
        )
        .subscribe();

      channelRef = channel;
    };

    setup();

    return () => {
      if (channelRef) {
        supabase.removeChannel(channelRef);
      }
    };
  }, []);
}
