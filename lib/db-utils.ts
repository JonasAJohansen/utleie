import { sql } from '@vercel/postgres'
import fs from 'fs'
import path from 'path'

export async function runMigration(migrationFile: string) {
  try {
    console.log(`Running migration: ${migrationFile}`)
    const filePath = path.join(process.cwd(), 'migrations', migrationFile)
    const sqlContent = fs.readFileSync(filePath, 'utf-8')

    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    // Execute each statement
    for (const statement of statements) {
      console.log('Executing:', statement)
      await sql.query(statement)
    }

    console.log(`Migration ${migrationFile} completed successfully`)
    return true
  } catch (error) {
    console.error(`Error running migration ${migrationFile}:`, error)
    return false
  }
}

export async function runAllMigrations() {
  try {
    const migrationsDir = path.join(process.cwd(), 'migrations')
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort()

    console.log('Found migrations:', files)

    for (const file of files) {
      const success = await runMigration(file)
      if (!success) {
        console.error(`Migration ${file} failed. Stopping.`)
        return false
      }
    }

    console.log('All migrations completed successfully')
    return true
  } catch (error) {
    console.error('Error running migrations:', error)
    return false
  }
}

export async function createMigrationTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    return true
  } catch (error) {
    console.error('Error creating migrations table:', error)
    return false
  }
}

export async function recordMigration(migrationName: string) {
  try {
    await sql`
      INSERT INTO migrations (name)
      VALUES (${migrationName})
      ON CONFLICT (name) DO NOTHING
    `
    return true
  } catch (error) {
    console.error('Error recording migration:', error)
    return false
  }
}

export async function getExecutedMigrations() {
  try {
    const result = await sql`
      SELECT name, executed_at
      FROM migrations
      ORDER BY executed_at ASC
    `
    return result.rows
  } catch (error) {
    console.error('Error getting executed migrations:', error)
    return []
  }
} 