CREATE TABLE public.site_settings (
  id text PRIMARY KEY DEFAULT 'main',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins insert site settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update site settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.site_settings (id, data) VALUES ('main', '{}'::jsonb) ON CONFLICT DO NOTHING;

ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS weekly_hours jsonb;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS is_open boolean NOT NULL DEFAULT true;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS owner_control_approved boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.owns_store(_user_id uuid, _store_id uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT EXISTS (SELECT 1 FROM public.stores WHERE id = _store_id AND owner_id = _user_id AND owner_control_approved) $$;

CREATE OR REPLACE FUNCTION public.protect_store_owner()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') AND (NEW.owner_id IS DISTINCT FROM OLD.owner_id OR NEW.owner_control_approved IS DISTINCT FROM OLD.owner_control_approved) THEN
    RAISE EXCEPTION 'Only admins can change store owner or owner approval';
  END IF;
  RETURN NEW;
END; $$;