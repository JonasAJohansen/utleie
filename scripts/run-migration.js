const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🚀 Starting sponsored listings migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', 'add_sponsored_listings_and_payments.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL by semicolon and filter out empty statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📄 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let skipCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}:`);
        console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
        
        await sql.query(statement);
        successCount++;
        console.log('✅ Success');
        
      } catch (error) {
        if (error.message.includes('already exists') || 
            error.message.includes('relation') && error.message.includes('already exists')) {
          console.log('⚠️  Skipped (already exists)');
          skipCount++;
        } else {
          console.error('❌ Error:', error.message);
          // Continue with other statements instead of stopping
        }
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Executed: ${successCount} statements`);
    console.log(`⚠️  Skipped: ${skipCount} statements`);
    
    // Test the tables were created
    console.log('\n🔍 Verifying tables...');
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('sponsorship_packages', 'payments', 'sponsored_listings')
      ORDER BY table_name
    `;
    
    console.log('📊 Created tables:', tables.rows.map(t => t.table_name));
    
    // Check if default packages were inserted
    const packageCount = await sql`SELECT COUNT(*) as count FROM sponsorship_packages`;
    console.log(`📦 Sponsorship packages: ${packageCount.rows[0].count}`);
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
