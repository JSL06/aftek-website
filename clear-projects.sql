-- Clear all projects from the database
DELETE FROM projects;

-- Reset the auto-increment counter (optional)
ALTER SEQUENCE projects_id_seq RESTART WITH 1;

-- Verify deletion
SELECT COUNT(*) as remaining_projects FROM projects; 