
CREATE TABLE public.managed_logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL, -- 'clients' or 'certifications'
  name text NOT NULL DEFAULT '',
  logo_url text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.managed_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read logos" ON public.managed_logos FOR SELECT USING (true);
CREATE POLICY "Admins can manage logos" ON public.managed_logos FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
