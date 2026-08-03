import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "order_status_updated"
  | "plugin_installed"
  | "plugin_uninstalled"
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "wholesale_application_reviewed";

interface LogAuditParams {
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Records an admin action in the audit log.
 * Fails silently (console only) so logging never blocks the primary action.
 */
export const logAudit = async ({
  action,
  entityType,
  entityId = null,
  description,
  metadata = {},
}: LogAuditParams) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      description: description ?? null,
      metadata: metadata as never,
    });

    if (error) console.error("Audit log failed:", error.message);
  } catch (err) {
    console.error("Audit log failed:", err);
  }
};
