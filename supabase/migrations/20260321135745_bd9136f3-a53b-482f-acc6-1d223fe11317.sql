
-- Add bilingual color names to product_colors
ALTER TABLE public.product_colors ADD COLUMN color_name_al text NOT NULL DEFAULT '';
ALTER TABLE public.product_colors ADD COLUMN color_name_en text NOT NULL DEFAULT '';

-- Migrate existing color_name to both columns
UPDATE public.product_colors SET color_name_al = color_name, color_name_en = color_name;

-- Create wishlists table
CREATE TABLE public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wishlist" ON public.wishlists
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist" ON public.wishlists
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist" ON public.wishlists
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
