-- This script adds a title column to the saved_searches table
-- Run this script if you need to add descriptive titles to saved searches

-- Check if the title column already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'saved_searches' 
        AND column_name = 'title'
    ) THEN
        -- Add the title column
        ALTER TABLE saved_searches ADD COLUMN title TEXT;
        
        -- Set default values based on search_query if available
        UPDATE saved_searches 
        SET title = 
            CASE 
                WHEN search_query->>'q' IS NOT NULL THEN search_query->>'q' 
                ELSE 'Saved Search ' || id::text
            END;
    END IF;
END
$$; 