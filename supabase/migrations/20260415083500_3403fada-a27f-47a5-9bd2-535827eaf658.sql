
-- cart_items: speed up user cart lookups (used by RLS + queries)
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items (user_id);

-- order_items: speed up order detail joins
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);

-- orders: speed up "my orders" + RLS checks
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);

-- payments: speed up payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments (user_id);

-- expenses: speed up date-range filters in accounting
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses (expense_date DESC);

-- products: speed up category filtering in shop
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);

-- wholesale_applications: speed up user status checks
CREATE INDEX IF NOT EXISTS idx_wholesale_apps_user_status ON public.wholesale_applications (user_id, status);

-- visitors: speed up analytics date queries
CREATE INDEX IF NOT EXISTS idx_visitors_visited_at ON public.visitors (visited_at DESC);
