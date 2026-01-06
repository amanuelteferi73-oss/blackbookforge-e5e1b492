-- Remove the constraint that limits day_number to 1-7
ALTER TABLE floor_days DROP CONSTRAINT IF EXISTS floor_days_day_number_check;