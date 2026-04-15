
-- 1. Enable RLS on hotel_staff and add admin-only policies
ALTER TABLE public.hotel_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all staff"
  ON public.hotel_staff FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert staff"
  ON public.hotel_staff FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update staff"
  ON public.hotel_staff FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete staff"
  ON public.hotel_staff FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Remove overly permissive public SELECT on user_roles
DROP POLICY IF EXISTS "ALLOW_ALL_SELECT_ROLES" ON public.user_roles;

-- 3. Fix hotel_staff_shifts: replace permissive ALL policy with admin-only
DROP POLICY IF EXISTS "Authenticated users can manage staff shifts" ON public.hotel_staff_shifts;

CREATE POLICY "Admins can view staff shifts"
  ON public.hotel_staff_shifts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert staff shifts"
  ON public.hotel_staff_shifts FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update staff shifts"
  ON public.hotel_staff_shifts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete staff shifts"
  ON public.hotel_staff_shifts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
