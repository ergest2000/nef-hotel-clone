
-- Collections table
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_al text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  description_al text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  slug text NOT NULL UNIQUE,
  parent_id uuid REFERENCES public.collections(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visible collections" ON public.collections
  FOR SELECT TO public USING (visible = true);

CREATE POLICY "Admins can manage collections" ON public.collections
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  title_al text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  description_al text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  code text DEFAULT '',
  color text DEFAULT '',
  color_hex text DEFAULT '#FFFFFF',
  composition_al text DEFAULT '',
  composition_en text DEFAULT '',
  dimensions_al text DEFAULT '',
  dimensions_en text DEFAULT '',
  weight_gsm integer DEFAULT 0,
  box_quantity integer DEFAULT 1,
  pieces_per_box integer DEFAULT 1,
  in_stock boolean NOT NULL DEFAULT true,
  customizable boolean NOT NULL DEFAULT false,
  product_info_al text DEFAULT '',
  product_info_en text DEFAULT '',
  return_policy_al text DEFAULT '',
  return_policy_en text DEFAULT '',
  tech_specs_al text DEFAULT '',
  tech_specs_en text DEFAULT '',
  image_url text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visible products" ON public.products
  FOR SELECT TO public USING (visible = true);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Product images table
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read product images" ON public.product_images
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage product images" ON public.product_images
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
