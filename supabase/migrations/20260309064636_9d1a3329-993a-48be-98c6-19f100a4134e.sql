
CREATE TABLE public.page_slugs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL UNIQUE,
  slug_al text NOT NULL,
  slug_en text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_slugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read slugs" ON public.page_slugs FOR SELECT USING (true);
CREATE POLICY "Admins can manage slugs" ON public.page_slugs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_page_slugs_updated_at BEFORE UPDATE ON public.page_slugs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
