GRANT SELECT ON public.stores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT ALL ON public.stores TO service_role;
DROP POLICY IF EXISTS "Anyone can view active stores" ON public.stores;
CREATE POLICY "Public can view active stores" ON public.stores FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Users view active, owned or all if admin" ON public.stores FOR SELECT TO authenticated USING (is_active = true OR owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));