const { sql } = require('@vercel/postgres');
const fs = require('fs');

async function runMigration() {
  try {
    console.log('Starting migration to add is_free column...');
    
    // Read and execute migration SQL
    const migration = fs.readFileSync('./migrations/add_is_free_column.sql', 'utf8');
    const statements = migration.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await sql.query(statement);
      }
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();