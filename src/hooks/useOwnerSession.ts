import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useOwnerSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    let receivedEvent = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      receivedEvent = true;
      if (live) { setUser(session?.user ?? null); setLoading(false); setError(null); }
    });
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!live || receivedEvent) return;
      setUser(data.session?.user ?? null);
      setError(sessionError?.message ?? null);
      setLoading(false);
    }).catch(() => { if (live) { setError("Unable to load your account. Please sign in again."); setLoading(false); } });
    return () => { live = false; subscription.unsubscribe(); };
  }, []);
  return { user, loading, error };
}