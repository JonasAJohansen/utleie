-- Migration to add is_free column to listings table
-- This allows tracking of free items separately from price

-- Add the is_free column to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- Update existing records where price is 0 to mark as free
UPDATE listings 
SET is_free = true 
WHERE price = 0;

-- Update the price constraint to allow 0 values
ALTER TABLE listings 
DROP CONSTRAINT IF EXISTS listings_price_check;

ALTER TABLE listings 
ADD CONSTRAINT listings_price_check CHECK (price >= 0);

-- Create index for better performance when filtering free items
CREATE INDEX IF NOT EXISTS idx_listings_is_free ON listings(is_free) WHERE is_free = true;

-- Create a combined index for free items by category
CREATE INDEX IF NOT EXISTS idx_listings_free_category ON listings(category_id, is_free) WHERE is_free = true;