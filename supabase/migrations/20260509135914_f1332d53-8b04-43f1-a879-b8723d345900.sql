
ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS pricing_type text NOT NULL DEFAULT 'retail',
  ADD COLUMN IF NOT EXISTS min_wholesale_qty integer;

ALTER TABLE public.cart_items
  ADD CONSTRAINT cart_items_pricing_type_check
  CHECK (pricing_type IN ('retail','wholesale'));

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS pricing_type text NOT NULL DEFAULT 'retail';

ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_pricing_type_check
  CHECK (pricing_type IN ('retail','wholesale'));

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_type text NOT NULL DEFAULT 'retail';

ALTER TABLE public.orders
  ADD CONSTRAINT orders_order_type_check
  CHECK (order_type IN ('retail','wholesale','mixed'));
