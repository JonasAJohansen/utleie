-- Add geographic coordinates and privacy radius to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS radius DECIMAL(5, 2) DEFAULT 2.0;

-- Create indexes for improved search performance
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_coordinates ON listings(latitude, longitude);

-- Add comment explaining the purpose of these fields
COMMENT ON COLUMN listings.latitude IS 'Approximate latitude with privacy offset';
COMMENT ON COLUMN listings.longitude IS 'Approximate longitude with privacy offset';
COMMENT ON COLUMN listings.radius IS 'Privacy radius in kilometers (default 2km)'; 