
-- Blog posts table
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_al text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  excerpt_al text NOT NULL DEFAULT '',
  excerpt_en text NOT NULL DEFAULT '',
  content_al text NOT NULL DEFAULT '',
  content_en text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  author text NOT NULL DEFAULT 'EGJEU Team',
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Anyone can read published posts" ON public.blog_posts
  FOR SELECT USING (published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
