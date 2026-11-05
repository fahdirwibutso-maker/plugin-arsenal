DROP POLICY IF EXISTS "Admins or owners update stores" ON public.stores;
CREATE POLICY "Admins or approved owners update stores" ON public.stores FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin') OR (owner_id = auth.uid() AND owner_control_approved))
WITH CHECK (public.has_role(auth.uid(),'admin') OR (owner_id = auth.uid() AND owner_control_approved));