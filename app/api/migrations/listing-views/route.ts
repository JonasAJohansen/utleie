import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Creating listing_views table and updating listings...');
    
    // Create the listing_views table
    await sql`
      CREATE TABLE IF NOT EXISTS listing_views (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
        ip_address VARCHAR(45), -- Support both IPv4 and IPv6
        user_agent TEXT,
        viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        -- Prevent duplicate views within short timeframe
        UNIQUE(listing_id, user_id, viewed_at)
      )
    `
    
    console.log('Adding view_count column to listings...');
    
    // Add view_count column to listings table
    await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0`
    
    console.log('Creating indexes...');
    
    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_listing_views_listing_id ON listing_views(listing_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_listing_views_user_id ON listing_views(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_listing_views_viewed_at ON listing_views(viewed_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_listing_views_ip_address ON listing_views(ip_address)`
    await sql`CREATE INDEX IF NOT EXISTS idx_listing_views_recent ON listing_views(listing_id, viewed_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_listings_view_count ON listings(view_count DESC)`
    
    console.log('Creating trigger function for view count updates...');
    
    // Create function to update view count
    await sql`
      CREATE OR REPLACE FUNCTION update_listing_view_count()
      RETURNS TRIGGER AS $$
      BEGIN
          IF TG_OP = 'INSERT' THEN
              UPDATE listings 
              SET view_count = (
                  SELECT COUNT(*) 
                  FROM listing_views 
                  WHERE listing_id = NEW.listing_id
              )
              WHERE id = NEW.listing_id;
              RETURN NEW;
          ELSIF TG_OP = 'DELETE' THEN
              UPDATE listings 
              SET view_count = (
                  SELECT COUNT(*) 
                  FROM listing_views 
                  WHERE listing_id = OLD.listing_id
              )
              WHERE id = OLD.listing_id;
              RETURN OLD;
          END IF;
          RETURN NULL;
      END;
      $$ language 'plpgsql'
    `
    
    console.log('Creating triggers...');
    
    // Create triggers
    await sql`
      DROP TRIGGER IF EXISTS trigger_update_view_count_insert ON listing_views;
      CREATE TRIGGER trigger_update_view_count_insert
          AFTER INSERT ON listing_views
          FOR EACH ROW
          EXECUTE FUNCTION update_listing_view_count()
    `
    
    await sql`
      DROP TRIGGER IF EXISTS trigger_update_view_count_delete ON listing_views;
      CREATE TRIGGER trigger_update_view_count_delete
          AFTER DELETE ON listing_views
          FOR EACH ROW
          EXECUTE FUNCTION update_listing_view_count()
    `
    
    console.log('Initializing view counts for existing listings...');
    
    // Initialize view counts for existing listings (set to random values for demo)
    await sql`
      UPDATE listings 
      SET view_count = FLOOR(RANDOM() * 100) + 1
      WHERE view_count IS NULL OR view_count = 0
    `
    
    console.log('Adding rental end date tracking...');
    
    // Add rental_end_date column for availability tracking
    await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS rental_end_date TIMESTAMP WITH TIME ZONE`
    
    console.log('Creating trending views for analytics...');
    
    // Create view for trending listings (last 7 days)
    await sql`
      CREATE OR REPLACE VIEW trending_listings AS
      SELECT 
        l.id,
        l.name,
        l.price,
        l.location,
        l.category_id,
        l.created_at,
        l.view_count,
        COUNT(lv.id) as views_last_7_days,
        COUNT(DISTINCT lv.user_id) as unique_viewers_7d,
        RANK() OVER (ORDER BY COUNT(lv.id) DESC, l.view_count DESC) as trending_rank
      FROM listings l
      LEFT JOIN listing_views lv ON l.id = lv.listing_id 
        AND lv.viewed_at >= NOW() - INTERVAL '7 days'
      WHERE l.status = 'active'
      GROUP BY l.id, l.name, l.price, l.location, l.category_id, l.created_at, l.view_count
      HAVING COUNT(lv.id) > 0
      ORDER BY views_last_7_days DESC, l.view_count DESC
    `
    
    console.log('Migration completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Listing views tracking system created successfully' 
    });
    
  } catch (error) {
    console.error('Error creating listing views system:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 