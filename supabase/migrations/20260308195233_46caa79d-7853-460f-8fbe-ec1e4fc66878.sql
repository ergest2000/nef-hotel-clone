
-- SEO metadata table
CREATE TABLE public.seo_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  lang text NOT NULL DEFAULT 'al',
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  seo_keywords text DEFAULT '',
  og_image text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(page, lang)
);

ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read seo" ON public.seo_metadata FOR SELECT USING (true);
CREATE POLICY "Admins can manage seo" ON public.seo_metadata FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Navigation menus table
CREATE TABLE public.nav_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL, -- 'header', 'footer_col1', 'footer_col2', 'footer_col3'
  label text NOT NULL,
  href text NOT NULL DEFAULT '#',
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nav_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read menus" ON public.nav_menus FOR SELECT USING (true);
CREATE POLICY "Admins can manage menus" ON public.nav_menus FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed header menu
INSERT INTO public.nav_menus (location, label, href, sort_order) VALUES
  ('header', 'About Us', '/company', 0),
  ('header', 'Our Clients', '/clients', 1),
  ('header', 'Certifications', '/#certifications', 2),
  ('header', 'Blog', '/blog', 3),
  ('header', 'Catalogue', '#', 4),
  ('header', 'Tailor Made', '/tailor-made', 5),
  ('header', 'Contact', '/contact', 6);

-- Seed footer menus
INSERT INTO public.nav_menus (location, label, href, sort_order) VALUES
  ('footer_col1', 'About Us', '/company', 0),
  ('footer_col1', 'Our Clients', '/clients', 1),
  ('footer_col1', 'Certifications', '/#certifications', 2),
  ('footer_col1', 'Blog', '/blog', 3),
  ('footer_col1', 'Catalogue', '#', 4),
  ('footer_col1', 'Tailor Made', '/tailor-made', 5);

INSERT INTO public.nav_menus (location, label, href, sort_order) VALUES
  ('footer_col2', 'Contact', '/contact', 0),
  ('footer_col2', 'Shipping', '#', 1),
  ('footer_col2', 'Payment Terms', '#', 2),
  ('footer_col2', 'Terms of Use', '#', 3),
  ('footer_col2', 'Privacy Policy', '#', 4);

-- Trigger for updated_at
CREATE TRIGGER update_seo_metadata_updated_at BEFORE UPDATE ON public.seo_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nav_menus_updated_at BEFORE UPDATE ON public.nav_menus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
