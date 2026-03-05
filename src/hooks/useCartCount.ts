import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCartCount = () => {
  const [count, setCount] = useState(0);

  const refresh = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", user.id);
      setCount(data?.reduce((sum, item) => sum + item.quantity, 0) || 0);
    } else {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      setCount(guestCart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0));
    }
  };

  useEffect(() => {
    refresh();

    const handleStorage = () => refresh();
    window.addEventListener("storage", handleStorage);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => refresh());

    // Listen for custom cart update events
    const handleCartUpdate = () => refresh();
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cart-updated", handleCartUpdate);
      subscription.unsubscribe();
    };
  }, []);

  return { count, refresh };
};
