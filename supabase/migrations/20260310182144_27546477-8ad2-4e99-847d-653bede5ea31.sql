
CREATE TABLE public.auth_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL DEFAULT '',
  event_type text NOT NULL DEFAULT 'login',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read auth logs" ON public.auth_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert auth logs" ON public.auth_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can delete auth logs" ON public.auth_logs
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
