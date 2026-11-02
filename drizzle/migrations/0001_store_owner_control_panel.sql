ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id);
UPDATE public.order_items oi SET store_id = p.store_id FROM public.products p WHERE oi.product_id = p.id AND oi.store_id IS NULL;
CREATE OR REPLACE FUNCTION public.snapshot_order_item_store() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.store_id := (SELECT store_id FROM public.products WHERE id = NEW.product_id); RETURN NEW; END $$;
CREATE TRIGGER snapshot_order_item_store BEFORE INSERT ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.snapshot_order_item_store();
CREATE INDEX IF NOT EXISTS order_items_store_order_idx ON public.order_items(store_id, order_id);
CREATE TABLE public.store_order_activity (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), store_id uuid NOT NULL REFERENCES public.stores(id), order_id uuid NOT NULL REFERENCES public.orders(id), status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','ready','shipped','delivered','cancelled')), notes text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(store_id,order_id)
);
GRANT SELECT, INSERT, UPDATE ON public.store_order_activity TO authenticated;
GRANT ALL ON public.store_order_activity TO service_role;
ALTER TABLE public.store_order_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read store activity" ON public.store_order_activity FOR SELECT TO authenticated USING (public.owns_store(auth.uid(),store_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners create store activity" ON public.store_order_activity FOR INSERT TO authenticated WITH CHECK ((public.owns_store(auth.uid(),store_id) OR public.has_role(auth.uid(),'admin')) AND EXISTS (SELECT 1 FROM public.order_items oi WHERE oi.order_id=store_order_activity.order_id AND oi.store_id=store_order_activity.store_id));
CREATE POLICY "Owners update store activity" ON public.store_order_activity FOR UPDATE TO authenticated USING (public.owns_store(auth.uid(),store_id) OR public.has_role(auth.uid(),'admin')) WITH CHECK (public.owns_store(auth.uid(),store_id) OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER store_activity_updated_at BEFORE UPDATE ON public.store_order_activity FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Owners read their order lines" ON public.order_items FOR SELECT TO authenticated USING (public.owns_store(auth.uid(),store_id));
CREATE OR REPLACE FUNCTION public.get_store_orders(_store_id uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$ BEGIN
IF auth.uid() IS NULL OR NOT (public.owns_store(auth.uid(),_store_id) OR public.has_role(auth.uid(),'admin')) THEN RAISE EXCEPTION 'Not authorized for this store'; END IF;
RETURN COALESCE((SELECT jsonb_agg(row_data ORDER BY placed_at DESC) FROM (SELECT o.created_at AS placed_at, jsonb_build_object('id',o.id,'created_at',o.created_at,'order_status',o.status,'shipping_address',o.shipping_address,'phone_number',o.phone_number,'status',COALESCE(a.status,'pending'),'notes',COALESCE(a.notes,''),'items',(SELECT jsonb_agg(jsonb_build_object('id',i.id,'name',i.product_name,'image',i.product_image,'quantity',i.quantity,'unit_price',i.unit_price,'total_price',i.total_price,'pricing_type',i.pricing_type)) FROM public.order_items i WHERE i.order_id=o.id AND i.store_id=_store_id),'payment',(SELECT jsonb_build_object('method',p.method,'status',p.status) FROM public.payments p WHERE p.order_id=o.id ORDER BY p.created_at DESC LIMIT 1)) AS row_data FROM public.orders o LEFT JOIN public.store_order_activity a ON a.order_id=o.id AND a.store_id=_store_id WHERE EXISTS(SELECT 1 FROM public.order_items i WHERE i.order_id=o.id AND i.store_id=_store_id)) q), '[]'::jsonb); END $$;
REVOKE ALL ON FUNCTION public.get_store_orders(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_store_orders(uuid) TO authenticated;
DROP POLICY "Store owners upload images" ON storage.objects;
CREATE POLICY "Store owners upload scoped images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='product-images' AND EXISTS(SELECT 1 FROM public.stores s WHERE s.owner_id=auth.uid() AND s.id::text=(storage.foldername(name))[1]));
CREATE POLICY "Store owners read scoped images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='product-images' AND EXISTS(SELECT 1 FROM public.stores s WHERE s.owner_id=auth.uid() AND s.id::text=(storage.foldername(name))[1]));
CREATE POLICY "Store owners delete scoped images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='product-images' AND EXISTS(SELECT 1 FROM public.stores s WHERE s.owner_id=auth.uid() AND s.id::text=(storage.foldername(name))[1]));