-- Add unit column to products for wholesale unit tracking
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit text NOT NULL DEFAULT 'piece';

-- Add comment for clarity
COMMENT ON COLUMN public.products.unit IS 'Selling unit: piece, bag, carton, kg, pack';