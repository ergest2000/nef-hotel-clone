
CREATE TABLE public.design_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL DEFAULT '',
  setting_group text NOT NULL DEFAULT 'general',
  label text NOT NULL DEFAULT '',
  setting_type text NOT NULL DEFAULT 'text',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.design_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read design settings" ON public.design_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage design settings" ON public.design_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_design_settings_updated_at BEFORE UPDATE ON public.design_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
