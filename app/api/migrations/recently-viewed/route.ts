import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Creating recently_viewed table...');
    
    // Create the recently_viewed table
    await sql`
      CREATE TABLE IF NOT EXISTS recently_viewed (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        -- Ensure unique combination of user and listing
        UNIQUE(user_id, listing_id)
      )
    `
    
    console.log('Creating indexes...');
    
    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_id ON recently_viewed(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_recently_viewed_listing_id ON recently_viewed(listing_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_recently_viewed_viewed_at ON recently_viewed(viewed_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_viewed_at ON recently_viewed(user_id, viewed_at DESC)`
    
    console.log('Creating trigger function...');
    
    // Create trigger function for updated_at
    await sql`
      CREATE OR REPLACE FUNCTION update_recently_viewed_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `
    
    console.log('Creating trigger...');
    
    // Create trigger
    await sql`
      DROP TRIGGER IF EXISTS update_recently_viewed_updated_at ON recently_viewed;
      CREATE TRIGGER update_recently_viewed_updated_at
          BEFORE UPDATE ON recently_viewed
          FOR EACH ROW
          EXECUTE FUNCTION update_recently_viewed_updated_at()
    `
    
    console.log('Migration completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Recently viewed table created successfully' 
    });
    
  } catch (error) {
    console.error('Error creating recently_viewed table:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 