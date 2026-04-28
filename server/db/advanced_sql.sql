-- TechAtlas Advanced SQL features for MySQL

-- =============================================
-- PHASE 1: Views
-- =============================================

CREATE OR REPLACE VIEW developer_technology_view AS
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
FROM developers d
LEFT JOIN region r ON d.region_id = r.id
LEFT JOIN developers_tech dt ON d.id = dt.developer_id
LEFT JOIN technology t ON dt.technology_id = t.id
LEFT JOIN tech_category tc ON t.category_id = tc.id
LEFT JOIN work_profile wp ON d.id = wp.developer_id;

CREATE OR REPLACE VIEW ai_tool_usage_view AS
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
FROM uses_ai ua
JOIN ai_tool ai ON ua.ai_tool_id = ai.id
JOIN developers d ON ua.developer_id = d.id
LEFT JOIN region r ON d.region_id = r.id
LEFT JOIN work_profile wp ON d.id = wp.developer_id;

CREATE OR REPLACE VIEW tech_category_insights AS
SELECT
  tc.id AS category_id,
  tc.name AS category_name,
  tc.popularity_score,
  COUNT(DISTINCT dt.developer_id) AS developer_count,
  COUNT(DISTINCT t.id) AS technology_count,
  ROUND(AVG(dt.proficiency), 2) AS avg_proficiency,
  ROUND(AVG(dt.years_used), 2) AS avg_years_used
FROM tech_category tc
LEFT JOIN technology t ON t.category_id = tc.id
LEFT JOIN developers_tech dt ON dt.technology_id = t.id
GROUP BY tc.id, tc.name, tc.popularity_score;

-- =============================================
-- PHASE 2: Triggers
-- =============================================

DELIMITER //

-- Trigger: Prevent negative salary
CREATE TRIGGER trg_validate_salary_before_insert
BEFORE INSERT ON work_profile
FOR EACH ROW
BEGIN
  IF NEW.salary IS NOT NULL AND NEW.salary < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Salary cannot be negative';
  END IF;
END //

CREATE TRIGGER trg_validate_salary_before_update
BEFORE UPDATE ON work_profile
FOR EACH ROW
BEGIN
  IF NEW.salary IS NOT NULL AND NEW.salary < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Salary cannot be negative';
  END IF;
END //

-- Trigger: Update popularity_score on tech usage change
CREATE TRIGGER trg_update_popularity_after_insert
AFTER INSERT ON developers_tech
FOR EACH ROW
BEGIN
  DECLARE cat_id VARCHAR(36);
  SELECT category_id INTO cat_id FROM technology WHERE id = NEW.technology_id;
  
  IF cat_id IS NOT NULL THEN
    UPDATE tech_category
    SET popularity_score = (
      SELECT COUNT(*) FROM developers_tech dt
      JOIN technology t ON dt.technology_id = t.id
      WHERE t.category_id = cat_id
    )
    WHERE id = cat_id;
  END IF;
END //

CREATE TRIGGER trg_update_popularity_after_delete
AFTER DELETE ON developers_tech
FOR EACH ROW
BEGIN
  DECLARE cat_id VARCHAR(36);
  SELECT category_id INTO cat_id FROM technology WHERE id = OLD.technology_id;
  
  IF cat_id IS NOT NULL THEN
    UPDATE tech_category
    SET popularity_score = (
      SELECT COUNT(*) FROM developers_tech dt
      JOIN technology t ON dt.technology_id = t.id
      WHERE t.category_id = cat_id
    )
    WHERE id = cat_id;
  END IF;
END //

DELIMITER ;

-- =============================================
-- PHASE 3: Stored Procedure with Cursor
-- =============================================

DELIMITER //

CREATE PROCEDURE GetDevelopersTopTechnology()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE dev_id VARCHAR(36);
  DECLARE dev_name TEXT;
  DECLARE tech_name TEXT;
  DECLARE tech_count INT;
  
  DECLARE dev_cursor CURSOR FOR SELECT id, name FROM developers;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  -- Create temporary table to hold results
  CREATE TEMPORARY TABLE IF NOT EXISTS TempTopTech (
    developer_id VARCHAR(36),
    developer_name TEXT,
    top_technology TEXT,
    usage_count INT
  );
  TRUNCATE TABLE TempTopTech;

  OPEN dev_cursor;

  read_loop: LOOP
    FETCH dev_cursor INTO dev_id, dev_name;
    IF done THEN
      LEAVE read_loop;
    END IF;

    -- Query to find top technology for current developer
    -- This inner query simulates the logic in the PostgreSQL procedure
    SELECT t.name, COUNT(*) INTO tech_name, tech_count
    FROM developers_tech dt
    JOIN technology t ON dt.technology_id = t.id
    WHERE dt.developer_id = dev_id
    GROUP BY t.name
    ORDER BY COUNT(*) DESC, t.name ASC
    LIMIT 1;

    IF tech_name IS NOT NULL THEN
      INSERT INTO TempTopTech VALUES (dev_id, dev_name, tech_name, tech_count);
    END IF;
    
    -- Reset variables for next iteration
    SET tech_name = NULL;
    SET tech_count = 0;
  END LOOP;

  CLOSE dev_cursor;
  
  -- Return the result set
  SELECT * FROM TempTopTech;
END //

DELIMITER ;
