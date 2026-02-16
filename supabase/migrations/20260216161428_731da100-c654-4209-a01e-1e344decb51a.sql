
-- Tighten the visitors insert policy to require page value
DROP POLICY "Anyone can log visits" ON public.visitors;

CREATE POLICY "Anyone can log visits"
  ON public.visitors FOR INSERT
  WITH CHECK (page IS NOT NULL AND page != '');
