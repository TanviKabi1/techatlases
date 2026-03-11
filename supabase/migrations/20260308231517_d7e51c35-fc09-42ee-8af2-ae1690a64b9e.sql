CREATE OR REPLACE FUNCTION public.execute_readonly_query(query_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  trimmed text;
BEGIN
  trimmed := lower(trim(query_text));
  
  -- Only allow SELECT statements
  IF NOT (trimmed LIKE 'select%') THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;
  
  -- Block dangerous keywords
  IF trimmed ~ '(drop|truncate|alter|create|insert|update|delete|grant|revoke|exec)' THEN
    RAISE EXCEPTION 'This query contains disallowed keywords';
  END IF;

  EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', query_text) INTO result;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;