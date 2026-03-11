-- Add batch tracking column to tables that receive CSV data
ALTER TABLE public.developers ADD COLUMN IF NOT EXISTS import_batch_id uuid DEFAULT NULL;
ALTER TABLE public.work_profile ADD COLUMN IF NOT EXISTS import_batch_id uuid DEFAULT NULL;
ALTER TABLE public.developers_tech ADD COLUMN IF NOT EXISTS import_batch_id uuid DEFAULT NULL;
ALTER TABLE public.uses_ai ADD COLUMN IF NOT EXISTS import_batch_id uuid DEFAULT NULL;
ALTER TABLE public.technology ADD COLUMN IF NOT EXISTS import_batch_id uuid DEFAULT NULL;
ALTER TABLE public.ai_tool ADD COLUMN IF NOT EXISTS import_batch_id uuid DEFAULT NULL;
ALTER TABLE public.company ADD COLUMN IF NOT EXISTS import_batch_id uuid DEFAULT NULL;
ALTER TABLE public.region ADD COLUMN IF NOT EXISTS import_batch_id uuid DEFAULT NULL;
ALTER TABLE public.tech_category ADD COLUMN IF NOT EXISTS import_batch_id uuid DEFAULT NULL;

-- Add file_name to raw_survey_data for display
ALTER TABLE public.raw_survey_data ADD COLUMN IF NOT EXISTS file_name text DEFAULT NULL;
ALTER TABLE public.raw_survey_data ADD COLUMN IF NOT EXISTS record_count integer DEFAULT 0;