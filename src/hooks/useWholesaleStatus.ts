import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useWholesaleStatus = () => {
  const [isWholesale, setIsWholesale] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("is_wholesale")
          .eq("user_id", session.user.id)
          .single();
        setIsWholesale(data?.is_wholesale ?? false);
      } else {
        setIsWholesale(false);
      }
      setLoading(false);
    };

    checkStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("is_wholesale")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => {
            setIsWholesale(data?.is_wholesale ?? false);
          });
      } else {
        setIsWholesale(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isWholesale, loading };
};
