CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo text,
  description text,
  location text,
  map_url text,
  phone text,
  opening_hours text,
  owner_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT ALL ON public.stores TO service_role;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active stores" ON public.stores FOR SELECT USING (is_active = true OR owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert stores" ON public.stores FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins or owners update stores" ON public.stores FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR owner_id = auth.uid()) WITH CHECK (public.has_role(auth.uid(),'admin') OR owner_id = auth.uid());
CREATE POLICY "Admins delete stores" ON public.stores FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Owners cannot reassign ownership
CREATE OR REPLACE FUNCTION public.protect_store_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') AND NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
    RAISE EXCEPTION 'Only admins can change store owner';
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.protect_store_owner() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER protect_store_owner_trg BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.protect_store_owner();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.products ADD COLUMN store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL;
CREATE INDEX idx_products_store_id ON public.products(store_id);
CREATE INDEX idx_stores_owner_id ON public.stores(owner_id);

CREATE OR REPLACE FUNCTION public.owns_store(_user_id uuid, _store_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.stores WHERE id = _store_id AND owner_id = _user_id)
$$;
REVOKE EXECUTE ON FUNCTION public.owns_store(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.owns_store(uuid, uuid) TO authenticated;

CREATE POLICY "Store owners view own products" ON public.products FOR SELECT TO authenticated USING (public.owns_store(auth.uid(), store_id));
CREATE POLICY "Store owners insert own products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.owns_store(auth.uid(), store_id));
CREATE POLICY "Store owners update own products" ON public.products FOR UPDATE TO authenticated USING (public.owns_store(auth.uid(), store_id)) WITH CHECK (public.owns_store(auth.uid(), store_id));
CREATE POLICY "Store owners delete own products" ON public.products FOR DELETE TO authenticated USING (public.owns_store(auth.uid(), store_id));

CREATE POLICY "Store owners upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM public.stores WHERE owner_id = auth.uid()));

INSERT INTO public.stores (name, slug, description, location) VALUES
 ('Wellar Store', 'wellar-store', 'The original WellarShop store.', 'Kigali, Rwanda'),
 ('Gahi Store', 'gahi-store', 'Fresh products from Gahi.', 'Kigali, Rwanda');
UPDATE public.products SET store_id = (SELECT id FROM public.stores WHERE slug='wellar-store') WHERE store_id IS NULL;