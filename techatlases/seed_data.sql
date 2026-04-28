-- TechAtlas Comprehensive Seed Script
-- run this in the Supabase SQL Editor (SQL Tools > New Query)

-- 1. Seed Regions
INSERT INTO public.region (name, continent) VALUES
('North America', 'Americas'),
('Western Europe', 'Europe'),
('Eastern Europe', 'Europe'),
('South Asia', 'Asia'),
('East Asia', 'Asia'),
('Latin America', 'Americas'),
('Africa', 'Africa'),
('Oceania', 'Oceania'),
('Middle East', 'Asia'),
('Southeast Asia', 'Asia')
ON CONFLICT (name) DO NOTHING;

-- 2. Seed Tech Categories
INSERT INTO public.tech_category (name, description, popularity_score) VALUES
('Frontend', 'Web client side technologies and frameworks', 95),
('Backend', 'Server side logic, APIs and databases', 90),
('Data Science', 'Machine learning, data analysis and visualization', 85),
('DevOps', 'Infrastructure, monitoring and CI/CD', 80),
('Mobile', 'Mobile application development for iOS and Android', 75),
('AI & LLM', 'Artificial Intelligence and Large Language Models', 98),
('Cloud Computing', 'Cloud infrastructure and serverless solutions', 88),
('Cybersecurity', 'Application and infrastructure security', 70),
('Game Dev', 'Game engine development and interactive media', 65),
('Embedded', 'Firmware and low-level system programming', 60)
ON CONFLICT (name) DO NOTHING;

-- 3. Seed Technologies
INSERT INTO public.technology (name, category_id)
SELECT 'React', id FROM public.tech_category WHERE name = 'Frontend'
UNION ALL SELECT 'Next.js', id FROM public.tech_category WHERE name = 'Frontend'
UNION ALL SELECT 'Vue.js', id FROM public.tech_category WHERE name = 'Frontend'
UNION ALL SELECT 'TypeScript', id FROM public.tech_category WHERE name = 'Frontend'
UNION ALL SELECT 'Tailwind CSS', id FROM public.tech_category WHERE name = 'Frontend'
UNION ALL SELECT 'Node.js', id FROM public.tech_category WHERE name = 'Backend'
UNION ALL SELECT 'Python', id FROM public.tech_category WHERE name = 'Backend'
UNION ALL SELECT 'Go', id FROM public.tech_category WHERE name = 'Backend'
UNION ALL SELECT 'PostgreSQL', id FROM public.tech_category WHERE name = 'Backend'
UNION ALL SELECT 'Rust', id FROM public.tech_category WHERE name = 'Backend'
UNION ALL SELECT 'PyTorch', id FROM public.tech_category WHERE name = 'Data Science'
UNION ALL SELECT 'Scikit-learn', id FROM public.tech_category WHERE name = 'Data Science'
UNION ALL SELECT 'Pandas', id FROM public.tech_category WHERE name = 'Data Science'
UNION ALL SELECT 'Docker', id FROM public.tech_category WHERE name = 'DevOps'
UNION ALL SELECT 'Kubernetes', id FROM public.tech_category WHERE name = 'DevOps'
UNION ALL SELECT 'React Native', id FROM public.tech_category WHERE name = 'Mobile'
UNION ALL SELECT 'Flutter', id FROM public.tech_category WHERE name = 'Mobile'
UNION ALL SELECT 'OpenAI API', id FROM public.tech_category WHERE name = 'AI & LLM'
UNION ALL SELECT 'LangChain', id FROM public.tech_category WHERE name = 'AI & LLM'
UNION ALL SELECT 'AWS', id FROM public.tech_category WHERE name = 'Cloud Computing'
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- 4. Seed AI Tools
INSERT INTO public.ai_tool (name, description, category) VALUES
('GitHub Copilot', 'AI pair programmer for code autocompletion', 'Development'),
('ChatGPT', 'General purpose LLM for research and drafting', 'Productivity'),
('Claude 3', 'Anthropic model with long context window', 'Productivity'),
('Cursor', 'AI-first code editor integrated with LLMs', 'Development'),
('Midjourney', 'High-quality AI image generation', 'Design'),
('v0.dev', 'Generative UI system for React/Tailwind', 'Frontend'),
('Replit Ghostwriter', 'AI assistant for local and cloud coding', 'Development'),
('Tabnine', 'Private AI code completion engine', 'Development'),
('Phind', 'Search engine for developers powered by AI', 'Productivity'),
('Perplexity', 'Conversational search and discovery', 'Productivity')
ON CONFLICT (name) DO NOTHING;

-- 5. Seed Companies
INSERT INTO public.company (name, size, industry, region_id)
SELECT 'Quantum Leap', 'Enterprise', 'Finance', id FROM public.region WHERE name = 'North America'
UNION ALL SELECT 'EcoSync', 'Startup', 'Deep Tech', id FROM public.region WHERE name = 'Western Europe'
UNION ALL SELECT 'CyberDyne', 'Medium', 'Robotics', id FROM public.region WHERE name = 'East Asia'
UNION ALL SELECT 'IndiTech', 'Large', 'Services', id FROM public.region WHERE name = 'South Asia'
UNION ALL SELECT 'Nexus Systems', 'Enterprise', 'SaaS', id FROM public.region WHERE name = 'Oceania'
ON CONFLICT DO NOTHING;

-- 6. Generate Massive Developer Dataset (200 records)
INSERT INTO public.developers (name, email, age, country, region_id, years_coding, education_level)
SELECT 
    'Talent_' || i,
    'talent_' || i || '@techatlas.io',
    21 + (i % 35),
    CASE (i % 8) 
        WHEN 0 THEN 'USA' WHEN 1 THEN 'Germany' WHEN 2 THEN 'India' 
        WHEN 3 THEN 'Japan' WHEN 4 THEN 'Brazil' WHEN 5 THEN 'Nigeria'
        WHEN 6 THEN 'UK' ELSE 'Canada' 
    END,
    (SELECT id FROM public.region ORDER BY random() LIMIT 1),
    1 + (i % 22),
    CASE (i % 5)
        WHEN 0 THEN 'Bachelors' WHEN 1 THEN 'Masters' WHEN 2 THEN 'PhD' 
        WHEN 3 THEN 'Associate' ELSE 'Self-taught'
    END
FROM generate_series(1, 200) i
ON CONFLICT DO NOTHING;

-- 7. Generate Work Profiles (linked 1:1 with devs)
INSERT INTO public.work_profile (developer_id, company_id, job_role, employment_type, salary, remote_work)
SELECT 
    id,
    (SELECT id FROM public.company ORDER BY random() LIMIT 1),
    CASE (random() * 6)::int
        WHEN 0 THEN 'Frontend Developer' WHEN 1 THEN 'Backend Engineer' 
        WHEN 2 THEN 'Fullstack Engineer' WHEN 3 THEN 'Machine Learning Engineer'
        WHEN 4 THEN 'SRE/DevOps' WHEN 5 THEN 'Solutions Architect' ELSE 'Product Manager'
    END,
    CASE (random() * 2)::int WHEN 0 THEN 'Full-time' WHEN 1 THEN 'Contract' ELSE 'Freelance' END,
    45000 + (random() * 140000)::int,
    CASE (random() * 2)::int WHEN 0 THEN 'Remote' WHEN 1 THEN 'On-site' ELSE 'Hybrid' END
FROM public.developers
ON CONFLICT (developer_id) DO NOTHING;

-- 8. Generate Tech Proficiencies (Massive junction data)
-- Each developer gets 3-7 technologies
INSERT INTO public.developers_tech (developer_id, technology_id, proficiency, years_used)
SELECT 
    d.id,
    t.id,
    1 + (random() * 4)::int,
    1 + (random() * 12)::int
FROM public.developers d
CROSS JOIN LATERAL (
    SELECT id FROM public.technology ORDER BY random() LIMIT (3 + (random() * 4)::int)
) t
ON CONFLICT DO NOTHING;

-- 9. Generate AI Tool Usage (Each dev uses 2-4 tools)
INSERT INTO public.uses_ai (developer_id, ai_tool_id, sentiment, use_case, adoption_score)
SELECT 
    d.id,
    a.id,
    CASE (random() * 2)::int WHEN 0 THEN 'Positive' WHEN 1 THEN 'Neutral' ELSE 'Negative' END,
    CASE (random() * 2)::int WHEN 0 THEN 'Production Coding' WHEN 1 THEN 'Learning/Upskilling' ELSE 'Automation' END,
    1 + (random() * 9)::int
FROM public.developers d
CROSS JOIN LATERAL (
    SELECT id FROM public.ai_tool ORDER BY random() LIMIT (2 + (random() * 2)::int)
) a
ON CONFLICT DO NOTHING;

-- 10. Populate Raw Staging (for testing imports)
INSERT INTO public.raw_survey_data (raw_json, processed)
SELECT 
    jsonb_build_object('name', 'Staged_Dev_' || i, 'source', 'manual_seed', 'timestamp', now()),
    false
FROM generate_series(1, 5) i;
