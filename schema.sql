-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id VARCHAR(255) NOT NULL REFERENCES users(id),
  user2_id VARCHAR(255) NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT different_users CHECK (user1_id != user2_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id VARCHAR(255) NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'text',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id VARCHAR(255),
  subcategory_id VARCHAR(255),
  location VARCHAR(255),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  radius DECIMAL(5, 2) DEFAULT 2.0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create listing_photos table
CREATE TABLE IF NOT EXISTS listing_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  url TEXT NOT NULL,
  description TEXT,
  is_main BOOLEAN DEFAULT false,
  display_order INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT max_photos_per_listing UNIQUE (listing_id, display_order),
  CONSTRAINT max_display_order CHECK (display_order >= 0 AND display_order < 4)
);

-- Create rental_requests table
CREATE TABLE IF NOT EXISTS rental_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  requester_id VARCHAR(255) NOT NULL REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  reviewer_id VARCHAR(255) NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  listing_id UUID NOT NULL REFERENCES listings(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, listing_id)
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id VARCHAR(255) NOT NULL REFERENCES users(id),
  listing_id UUID NOT NULL REFERENCES listings(id),
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  search_query JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  name VARCHAR(255) PRIMARY KEY,
  description TEXT,
  icon VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update listings table to reference category name
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_category_id_fkey;
ALTER TABLE listings DROP COLUMN IF EXISTS category_id;
ALTER TABLE listings ADD COLUMN category_id VARCHAR(255) REFERENCES categories(name);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_subcategory ON listings(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_coordinates ON listings(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_rental_requests_listing_id ON rental_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_rental_requests_requester_id ON rental_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_listing_id ON reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_listing_photos_listing_id ON listing_photos(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_photos_main ON listing_photos(listing_id) WHERE is_main = true;
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE NOT is_read;

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

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_norwegian_cities_name ON norwegian_locations(place_name) WHERE category IN ('G', 'B');

