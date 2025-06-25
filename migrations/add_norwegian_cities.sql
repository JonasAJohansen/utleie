-- Add Norwegian cities and postal areas support
-- This migration adds a comprehensive table for Norwegian locations

-- Create Norwegian municipalities and postal areas table
CREATE TABLE IF NOT EXISTS norwegian_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  postal_code VARCHAR(4) NOT NULL,
  place_name VARCHAR(255) NOT NULL,
  municipality_code VARCHAR(4) NOT NULL,
  municipality_name VARCHAR(255) NOT NULL,
  county_name VARCHAR(255) NOT NULL,
  county_code VARCHAR(2) NOT NULL,
  region VARCHAR(255),
  category CHAR(1),
  category_description VARCHAR(255),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for Norwegian locations
CREATE INDEX IF NOT EXISTS idx_norwegian_locations_postal_code ON norwegian_locations(postal_code);
CREATE INDEX IF NOT EXISTS idx_norwegian_locations_place_name ON norwegian_locations(place_name);
CREATE INDEX IF NOT EXISTS idx_norwegian_locations_municipality ON norwegian_locations(municipality_name);
CREATE INDEX IF NOT EXISTS idx_norwegian_locations_county ON norwegian_locations(county_name);
CREATE INDEX IF NOT EXISTS idx_norwegian_locations_coordinates ON norwegian_locations(latitude, longitude);

-- Create a view for unique cities/places for autocomplete
CREATE OR REPLACE VIEW norwegian_cities AS
SELECT DISTINCT 
  place_name as city_name,
  municipality_name,
  county_name,
  county_code,
  COUNT(*) as postal_code_count,
  MIN(postal_code) as min_postal_code,
  MAX(postal_code) as max_postal_code
FROM norwegian_locations 
WHERE category IN ('G', 'B') -- Only street addresses and post boxes (actual populated areas)
GROUP BY place_name, municipality_name, county_name, county_code
ORDER BY place_name;

-- Create index for faster city lookups
CREATE INDEX IF NOT EXISTS idx_norwegian_cities_name ON norwegian_locations(place_name) WHERE category IN ('G', 'B'); 