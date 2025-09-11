import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

const migrationStatements = [
  // Create sponsorship packages table
  `CREATE TABLE IF NOT EXISTS sponsorship_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_nok DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 30,
    stripe_price_id VARCHAR(255),
    position_priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,

  // Create payments table
  `CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    package_id UUID REFERENCES sponsorship_packages(id),
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255),
    amount_nok DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NOK',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method_type VARCHAR(50),
    stripe_webhook_received BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,

  // Create sponsored listings table
  `CREATE TABLE IF NOT EXISTS sponsored_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id),
    package_id UUID NOT NULL REFERENCES sponsorship_packages(id),
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
    category_id VARCHAR(255) REFERENCES categories(name),
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    position_priority INTEGER DEFAULT 1,
    impressions_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,

  // Add columns to listings table
  `ALTER TABLE listings 
   ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT false`,
  
  `ALTER TABLE listings 
   ADD COLUMN IF NOT EXISTS sponsored_until TIMESTAMP WITH TIME ZONE`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_listing_id ON payments(listing_id)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id)`,
  
  `CREATE INDEX IF NOT EXISTS idx_sponsored_listings_listing_id ON sponsored_listings(listing_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sponsored_listings_category_id ON sponsored_listings(category_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sponsored_listings_expires_at ON sponsored_listings(expires_at)`,
  `CREATE INDEX IF NOT EXISTS idx_sponsored_listings_is_active ON sponsored_listings(is_active)`,
  `CREATE INDEX IF NOT EXISTS idx_sponsored_listings_priority ON sponsored_listings(position_priority)`,
  
  `CREATE INDEX IF NOT EXISTS idx_listings_is_sponsored ON listings(is_sponsored)`,
  `CREATE INDEX IF NOT EXISTS idx_listings_sponsored_until ON listings(sponsored_until)`,

  // Insert default packages
  `INSERT INTO sponsorship_packages (name, description, price_nok, duration_days, position_priority) 
   VALUES ('Basic Sponsorship', 'Featured placement for 7 days in your category', 199.00, 7, 1)
   ON CONFLICT DO NOTHING`,
   
  `INSERT INTO sponsorship_packages (name, description, price_nok, duration_days, position_priority) 
   VALUES ('Premium Sponsorship', 'Top placement for 30 days with enhanced visibility', 699.00, 30, 2)
   ON CONFLICT DO NOTHING`,
   
  `INSERT INTO sponsorship_packages (name, description, price_nok, duration_days, position_priority) 
   VALUES ('Extended Sponsorship', 'Maximum visibility for 90 days with priority positioning', 1899.00, 90, 3)
   ON CONFLICT DO NOTHING`
]

const functionStatements = [
  // Create function to update listing sponsorship status
  `CREATE OR REPLACE FUNCTION update_listing_sponsorship_status()
   RETURNS TRIGGER AS $$
   BEGIN
     IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
       UPDATE listings 
       SET 
         is_sponsored = CASE 
           WHEN NEW.is_active AND NEW.expires_at > CURRENT_TIMESTAMP THEN true
           ELSE false
         END,
         sponsored_until = CASE 
           WHEN NEW.is_active AND NEW.expires_at > CURRENT_TIMESTAMP THEN NEW.expires_at
           ELSE NULL
         END
       WHERE id = NEW.listing_id;
       
       RETURN NEW;
     END IF;
     
     IF TG_OP = 'DELETE' THEN
       UPDATE listings 
       SET is_sponsored = false, sponsored_until = NULL
       WHERE id = OLD.listing_id;
       
       RETURN OLD;
     END IF;
     
     RETURN NULL;
   END;
   $$ LANGUAGE plpgsql`,

  // Create trigger
  `DROP TRIGGER IF EXISTS trigger_update_listing_sponsorship ON sponsored_listings`,
  
  `CREATE TRIGGER trigger_update_listing_sponsorship
   AFTER INSERT OR UPDATE OR DELETE ON sponsored_listings
   FOR EACH ROW
   EXECUTE FUNCTION update_listing_sponsorship_status()`,

  // Create cleanup function
  `CREATE OR REPLACE FUNCTION cleanup_expired_sponsorships()
   RETURNS INTEGER AS $$
   DECLARE
     updated_count INTEGER;
   BEGIN
     UPDATE sponsored_listings 
     SET is_active = false 
     WHERE is_active = true 
       AND expires_at <= CURRENT_TIMESTAMP;
     
     GET DIAGNOSTICS updated_count = ROW_COUNT;
     
     UPDATE listings 
     SET is_sponsored = false, sponsored_until = NULL
     WHERE is_sponsored = true 
       AND (sponsored_until IS NULL OR sponsored_until <= CURRENT_TIMESTAMP);
     
     RETURN updated_count;
   END;
   $$ LANGUAGE plpgsql`,

  // Create random sponsored listing function
  `CREATE OR REPLACE FUNCTION get_random_sponsored_listing_for_category(target_category VARCHAR(255))
   RETURNS TABLE(listing_id UUID, priority INTEGER) AS $$
   BEGIN
     RETURN QUERY
     SELECT 
       sl.listing_id,
       sl.position_priority as priority
     FROM sponsored_listings sl
     JOIN listings l ON sl.listing_id = l.id
     WHERE sl.is_active = true
       AND sl.expires_at > CURRENT_TIMESTAMP
       AND (sl.category_id = target_category OR sl.category_id IS NULL)
       AND l.status = 'active'
     ORDER BY 
       sl.position_priority DESC,
       RANDOM()
     LIMIT 1;
   END;
   $$ LANGUAGE plpgsql`
]

export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🚀 Starting sponsored listings migration...')
    
    let successCount = 0
    let skipCount = 0
    const errors = []

    // Execute main table creation and data statements
    for (let i = 0; i < migrationStatements.length; i++) {
      const statement = migrationStatements[i]
      
      try {
        console.log(`⚡ Executing statement ${i + 1}/${migrationStatements.length}`)
        await sql.query(statement)
        successCount++
        console.log('✅ Success')
        
      } catch (error: any) {
        if (error.message?.includes('already exists') || 
            error.message?.includes('relation') && error.message?.includes('already exists')) {
          console.log('⚠️  Skipped (already exists)')
          skipCount++
        } else {
          console.error('❌ Error:', error.message)
          errors.push(`Statement ${i + 1}: ${error.message}`)
        }
      }
    }

    // Execute function and trigger statements
    for (let i = 0; i < functionStatements.length; i++) {
      const statement = functionStatements[i]
      
      try {
        console.log(`⚡ Executing function ${i + 1}/${functionStatements.length}`)
        await sql.query(statement)
        successCount++
        console.log('✅ Success')
        
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        errors.push(`Function ${i + 1}: ${error.message}`)
      }
    }
    
    console.log('🔍 Verifying tables...')
    
    // Test the tables were created
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('sponsorship_packages', 'payments', 'sponsored_listings')
      ORDER BY table_name
    `
    
    const createdTables = tables.rows.map(t => t.table_name)
    console.log('📊 Created tables:', createdTables)
    
    // Check if default packages were inserted
    const packageCount = await sql`SELECT COUNT(*) as count FROM sponsorship_packages`
    console.log(`📦 Sponsorship packages: ${packageCount.rows[0].count}`)

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      stats: {
        successCount,
        skipCount,
        totalStatements: migrationStatements.length + functionStatements.length,
        createdTables,
        packageCount: parseInt(packageCount.rows[0].count),
        errors
      }
    })

  } catch (error: any) {
    console.error('💥 Migration failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
