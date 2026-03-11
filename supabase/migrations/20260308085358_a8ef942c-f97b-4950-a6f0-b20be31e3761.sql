
-- Fix views: set security_invoker = true
CREATE OR REPLACE VIEW public.developer_technology_view
WITH (security_invoker = true)
AS
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

CREATE OR REPLACE VIEW public.ai_tool_usage_view
WITH (security_invoker = true)
AS
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

CREATE OR REPLACE VIEW public.tech_category_insights
WITH (security_invoker = true)
AS
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

-- Fix functions: set search_path
CREATE OR REPLACE FUNCTION public.validate_salary()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.salary IS NOT NULL AND NEW.salary < 0 THEN
    RAISE EXCEPTION 'Salary cannot be negative';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_popularity_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  cat_id UUID;
BEGIN
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

CREATE OR REPLACE FUNCTION public.get_developers_top_technology()
RETURNS TABLE(developer_id UUID, developer_name TEXT, top_technology TEXT, usage_count BIGINT)
LANGUAGE plpgsql
SET search_path = public
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
