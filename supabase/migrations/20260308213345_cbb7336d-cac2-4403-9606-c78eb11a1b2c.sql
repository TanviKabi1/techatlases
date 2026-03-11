
-- User saved technologies
CREATE TABLE public.saved_technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  technology_name TEXT NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, technology_name)
);

ALTER TABLE public.saved_technologies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved technologies" ON public.saved_technologies
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User saved trends
CREATE TABLE public.saved_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trend_name TEXT NOT NULL,
  trend_category TEXT,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, trend_name)
);

ALTER TABLE public.saved_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved trends" ON public.saved_trends
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User learning roadmap items
CREATE TABLE public.user_roadmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  technology_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  priority INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, technology_name)
);

ALTER TABLE public.user_roadmap ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own roadmap" ON public.user_roadmap
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
