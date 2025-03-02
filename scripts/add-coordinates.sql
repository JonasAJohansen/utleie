-- Add geographic coordinates and privacy radius to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS radius DECIMAL(5, 2) DEFAULT 2.0;

-- Create indexes for improved search performance
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_coordinates ON listings(latitude, longitude);

-- Create temporary locations mapping table
CREATE TEMPORARY TABLE temp_location_mapping (
  location_name VARCHAR(255),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  radius DECIMAL(5, 2)
);

-- Insert well-known Norwegian locations
INSERT INTO temp_location_mapping (location_name, latitude, longitude, radius) VALUES
('Oslo', 59.9139, 10.7522, 2.0),
('Bergen', 60.3913, 5.3221, 2.0),
('Trondheim', 63.4305, 10.3951, 2.0),
('Stavanger', 58.9690, 5.7331, 2.0),
('Tromsø', 69.6496, 18.9570, 2.0),
('Kristiansand', 58.1599, 8.0182, 2.0),
('Ålesund', 62.4722, 6.1495, 2.0),
('Drammen', 59.7440, 10.2045, 2.0),
('Fredrikstad', 59.2181, 10.9298, 2.0),
('Sandnes', 58.8522, 5.7414, 2.0),
('Bodø', 67.2804, 14.4050, 2.0),
('Sarpsborg', 59.2847, 11.1094, 2.0),
('Sandefjord', 59.1333, 10.2167, 2.0),
('Arendal', 58.4610, 8.7710, 2.0);

-- Update existing listings with coordinates based on location name
UPDATE listings
SET 
  latitude = (
    SELECT tm.latitude + ((random() - 0.5) * (tm.radius / 111))
    FROM temp_location_mapping tm
    WHERE lower(listings.location) LIKE '%' || lower(tm.location_name) || '%'
    LIMIT 1
  ),
  longitude = (
    SELECT tm.longitude + ((random() - 0.5) * (tm.radius / 111))
    FROM temp_location_mapping tm
    WHERE lower(listings.location) LIKE '%' || lower(tm.location_name) || '%'
    LIMIT 1
  ),
  radius = (
    SELECT tm.radius
    FROM temp_location_mapping tm
    WHERE lower(listings.location) LIKE '%' || lower(tm.location_name) || '%'
    LIMIT 1
  )
WHERE 
  (latitude IS NULL OR longitude IS NULL)
  AND location IS NOT NULL;

-- Set default radius for any listing that still doesn't have it
UPDATE listings 
SET radius = 2.0
WHERE radius IS NULL;

-- For any listings still missing coordinates, set to Oslo with a wide radius
UPDATE listings
SET 
  latitude = 59.9139 + ((random() - 0.5) * 0.2),
  longitude = 10.7522 + ((random() - 0.5) * 0.2),
  radius = 10.0
WHERE 
  (latitude IS NULL OR longitude IS NULL);

-- Drop the temporary table
DROP TABLE temp_location_mapping;

-- Add comment explaining the purpose of these fields
COMMENT ON COLUMN listings.latitude IS 'Approximate latitude with privacy offset';
COMMENT ON COLUMN listings.longitude IS 'Approximate longitude with privacy offset';
COMMENT ON COLUMN listings.radius IS 'Privacy radius in kilometers (default 2km)'; 