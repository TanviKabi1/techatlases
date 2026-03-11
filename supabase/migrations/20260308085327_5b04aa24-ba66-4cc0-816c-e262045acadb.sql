
-- =============================================
-- PHASE 1: Core Tables
-- =============================================

-- Region table
CREATE TABLE public.region (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  continent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Company table
CREATE TABLE public.company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size TEXT,
  industry TEXT,
  region_id UUID REFERENCES public.region(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tech category table
CREATE TABLE public.tech_category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  popularity_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Technology table
CREATE TABLE public.technology (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.tech_category(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI tool table
CREATE TABLE public.ai_tool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Developers table
CREATE TABLE public.developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  age INTEGER,
  country TEXT,
  region_id UUID REFERENCES public.region(id) ON DELETE SET NULL,
  years_coding INTEGER,
  education_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Work profile table
CREATE TABLE public.work_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES public.developers(id) ON DELETE CASCADE UNIQUE,
  company_id UUID REFERENCES public.company(id) ON DELETE SET NULL,
  job_role TEXT,
  employment_type TEXT,
  salary NUMERIC,
  remote_work TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Developers-Tech junction table
CREATE TABLE public.developers_tech (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES public.developers(id) ON DELETE CASCADE,
  technology_id UUID NOT NULL REFERENCES public.technology(id) ON DELETE CASCADE,
  proficiency INTEGER DEFAULT 1,
  years_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(developer_id, technology_id)
);

-- Uses AI junction table
CREATE TABLE public.uses_ai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES public.developers(id) ON DELETE CASCADE,
  ai_tool_id UUID NOT NULL REFERENCES public.ai_tool(id) ON DELETE CASCADE,
  sentiment TEXT,
  use_case TEXT,
  adoption_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(developer_id, ai_tool_id)
);

-- Raw survey data staging table
CREATE TABLE public.raw_survey_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_json JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- =============================================
-- PHASE 2: User Roles (for admin auth)
-- =============================================

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PHASE 3: RLS Policies
-- =============================================

ALTER TABLE public.region ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technology ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developers_tech ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uses_ai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_survey_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Public read for analytics tables
CREATE POLICY "Anyone can read regions" ON public.region FOR SELECT USING (true);
CREATE POLICY "Anyone can read companies" ON public.company FOR SELECT USING (true);
CREATE POLICY "Anyone can read tech_categories" ON public.tech_category FOR SELECT USING (true);
CREATE POLICY "Anyone can read technologies" ON public.technology FOR SELECT USING (true);
CREATE POLICY "Anyone can read ai_tools" ON public.ai_tool FOR SELECT USING (true);
CREATE POLICY "Anyone can read developers" ON public.developers FOR SELECT USING (true);
CREATE POLICY "Anyone can read work_profiles" ON public.work_profile FOR SELECT USING (true);
CREATE POLICY "Anyone can read developers_tech" ON public.developers_tech FOR SELECT USING (true);
CREATE POLICY "Anyone can read uses_ai" ON public.uses_ai FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Admins can insert regions" ON public.region FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update regions" ON public.region FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete regions" ON public.region FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert companies" ON public.company FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update companies" ON public.company FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete companies" ON public.company FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert tech_categories" ON public.tech_category FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update tech_categories" ON public.tech_category FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete tech_categories" ON public.tech_category FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert technologies" ON public.technology FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update technologies" ON public.technology FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete technologies" ON public.technology FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert ai_tools" ON public.ai_tool FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update ai_tools" ON public.ai_tool FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete ai_tools" ON public.ai_tool FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert developers" ON public.developers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update developers" ON public.developers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete developers" ON public.developers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert work_profiles" ON public.work_profile FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update work_profiles" ON public.work_profile FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete work_profiles" ON public.work_profile FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert developers_tech" ON public.developers_tech FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update developers_tech" ON public.developers_tech FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete developers_tech" ON public.developers_tech FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert uses_ai" ON public.uses_ai FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update uses_ai" ON public.uses_ai FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete uses_ai" ON public.uses_ai FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage raw_survey_data" ON public.raw_survey_data FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- =============================================
-- PHASE 4: Views
-- =============================================

CREATE OR REPLACE VIEW public.developer_technology_view AS
SELECT
  d.id AS developer_id,
  d.name AS developer_name,
  d.country,
  r.name AS region_name,
  t.name AS technology_name,
  tc.name AS category_name,
  dt.proficiency,
  dt.years_used,
  wp.job_role,
  wp.salary
FROM public.developers d
LEFT JOIN public.region r ON d.region_id = r.id
LEFT JOIN public.developers_tech dt ON d.id = dt.developer_id
LEFT JOIN public.technology t ON dt.technology_id = t.id
LEFT JOIN public.tech_category tc ON t.category_id = tc.id
LEFT JOIN public.work_profile wp ON d.id = wp.developer_id;

CREATE OR REPLACE VIEW public.ai_tool_usage_view AS
SELECT
  ai.name AS tool_name,
  ai.category AS tool_category,
  ua.sentiment,
  ua.use_case,
  ua.adoption_score,
  d.name AS developer_name,
  d.country,
  r.name AS region_name,
  wp.job_role
FROM public.uses_ai ua
JOIN public.ai_tool ai ON ua.ai_tool_id = ai.id
JOIN public.developers d ON ua.developer_id = d.id
LEFT JOIN public.region r ON d.region_id = r.id
LEFT JOIN public.work_profile wp ON d.id = wp.developer_id;

CREATE OR REPLACE VIEW public.tech_category_insights AS
SELECT
  tc.id AS category_id,
  tc.name AS category_name,
  tc.popularity_score,
  COUNT(DISTINCT dt.developer_id) AS developer_count,
  COUNT(DISTINCT t.id) AS technology_count,
  ROUND(AVG(dt.proficiency)::numeric, 2) AS avg_proficiency,
  ROUND(AVG(dt.years_used)::numeric, 2) AS avg_years_used
FROM public.tech_category tc
LEFT JOIN public.technology t ON t.category_id = tc.id
LEFT JOIN public.developers_tech dt ON dt.technology_id = t.id
GROUP BY tc.id, tc.name, tc.popularity_score;

-- =============================================
-- PHASE 5: Triggers
-- =============================================

-- Trigger: Prevent negative salary
CREATE OR REPLACE FUNCTION public.validate_salary()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.salary IS NOT NULL AND NEW.salary < 0 THEN
    RAISE EXCEPTION 'Salary cannot be negative';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_salary
BEFORE INSERT OR UPDATE ON public.work_profile
FOR EACH ROW
EXECUTE FUNCTION public.validate_salary();

-- Trigger: Auto-update popularity_score on tech usage change
CREATE OR REPLACE FUNCTION public.update_popularity_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  cat_id UUID;
BEGIN
  -- Get category_id for the technology
  SELECT category_id INTO cat_id FROM public.technology WHERE id = NEW.technology_id;
  
  IF cat_id IS NOT NULL THEN
    UPDATE public.tech_category
    SET popularity_score = (
      SELECT COUNT(*) FROM public.developers_tech dt
      JOIN public.technology t ON dt.technology_id = t.id
      WHERE t.category_id = cat_id
    )
    WHERE id = cat_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_popularity
AFTER INSERT OR DELETE ON public.developers_tech
FOR EACH ROW
EXECUTE FUNCTION public.update_popularity_score();

-- =============================================
-- PHASE 6: Stored Procedure with Cursor
-- =============================================

CREATE OR REPLACE FUNCTION public.get_developers_top_technology()
RETURNS TABLE(developer_id UUID, developer_name TEXT, top_technology TEXT, usage_count BIGINT)
LANGUAGE plpgsql
AS $$
DECLARE
  dev_cursor CURSOR FOR SELECT id, name FROM public.developers;
  dev_record RECORD;
  tech_name TEXT;
  tech_count BIGINT;
BEGIN
  OPEN dev_cursor;
  LOOP
    FETCH dev_cursor INTO dev_record;
    EXIT WHEN NOT FOUND;
    
    SELECT t.name, COUNT(*) INTO tech_name, tech_count
    FROM public.developers_tech dt
    JOIN public.technology t ON dt.technology_id = t.id
    WHERE dt.developer_id = dev_record.id
    GROUP BY t.name
    ORDER BY COUNT(*) DESC, t.name ASC
    LIMIT 1;
    
    IF tech_name IS NOT NULL THEN
      developer_id := dev_record.id;
      developer_name := dev_record.name;
      top_technology := tech_name;
      usage_count := tech_count;
      RETURN NEXT;
    END IF;
  END LOOP;
  CLOSE dev_cursor;
END;
$$;

-- =============================================
-- PHASE 7: Auto-create profile on signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'email', NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
