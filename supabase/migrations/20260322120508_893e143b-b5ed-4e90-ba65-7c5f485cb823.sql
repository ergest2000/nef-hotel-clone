
CREATE TABLE public.homepage_suggested_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

ALTER TABLE public.homepage_suggested_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage suggested products" ON public.homepage_suggested_products
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read suggested products" ON public.homepage_suggested_products
  FOR SELECT TO public USING (true);

CREATE TABLE public.homepage_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_al text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  link_url text NOT NULL DEFAULT '#',
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage homepage categories" ON public.homepage_categories
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read visible homepage categories" ON public.homepage_categories
  FOR SELECT TO public USING (visible = true);

CREATE TABLE public.static_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  title_al text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  content_al text NOT NULL DEFAULT '',
  content_en text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(page_key)
);

ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage static pages" ON public.static_pages
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read static pages" ON public.static_pages
  FOR SELECT TO public USING (true);
