
-- Registration fields (form builder)
CREATE TABLE public.registration_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_key text NOT NULL UNIQUE,
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text',
  placeholder text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'User',
  required boolean NOT NULL DEFAULT true,
  visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.registration_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage fields" ON public.registration_fields FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read fields" ON public.registration_fields FOR SELECT TO anon, authenticated
  USING (true);

-- Registrations (submissions)
CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage registrations" ON public.registrations FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert registrations" ON public.registrations FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Seed default fields
INSERT INTO public.registration_fields (field_key, label, field_type, placeholder, icon, sort_order) VALUES
  ('business', 'Emri i biznesit', 'text', 'Hotel / Resort name', 'Building2', 0),
  ('fullName', 'Emër & Mbiemër', 'text', 'Full name', 'User', 1),
  ('email', 'E-mail', 'email', 'your@email.com', 'Mail', 2),
  ('phone', 'Numër Telefoni (WhatsApp)', 'tel', '+355 69 000 0000', 'Phone', 3),
  ('city', 'Qyteti / Shteti', 'text', 'City / Country', 'MapPin', 4),
  ('message', 'Mesazh / Detaje shtesë', 'textarea', 'Shkruani kërkesën ose nevojat tuaja...', 'MessageSquare', 5);
