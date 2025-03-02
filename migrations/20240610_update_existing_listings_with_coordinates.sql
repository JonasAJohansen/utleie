-- Migration script to add approximate coordinates to existing listings
-- This script will update listings that have a location but no coordinates

-- Create temporary locations mapping table with approximate coordinates for Norwegian locations
CREATE TEMPORARY TABLE temp_location_mapping (
  location_name VARCHAR(255),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  radius DECIMAL(5, 2)
);

-- Insert well-known Norwegian locations with their approximate coordinates
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
('Arendal', 58.4610, 8.7710, 2.0),
('Tønsberg', 59.2674, 10.4075, 2.0),
('Porsgrunn', 59.1414, 9.6530, 2.0),
('Haugesund', 59.4139, 5.2673, 2.0),
('Halden', 59.1231, 11.3874, 2.0),
('Akershus', 59.9139, 10.7522, 5.0), -- County - wider radius
('Hordaland', 60.3913, 5.7331, 5.0), -- County - wider radius
('Rogaland', 58.9690, 5.7331, 5.0), -- County - wider radius
('Trøndelag', 63.4305, 10.3951, 5.0), -- County - wider radius
('Vestfold', 59.1333, 10.2167, 5.0), -- County - wider radius
('Østfold', 59.2181, 10.9298, 5.0), -- County - wider radius
('Nordland', 67.2804, 14.4050, 5.0), -- County - wider radius
('Hedmark', 60.7945, 11.0680, 5.0), -- County - wider radius
('Oppland', 61.5000, 9.9000, 5.0), -- County - wider radius
('Vestlandet', 61.0000, 6.0000, 8.0), -- Region - even wider radius
('Sørlandet', 58.3000, 8.3000, 8.0), -- Region - even wider radius
('Nord-Norge', 68.0000, 16.0000, 10.0); -- Region - very wide radius

-- Update existing listings without coordinates
-- Add random offset within location's default radius for privacy
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