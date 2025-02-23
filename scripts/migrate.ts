import { createMigrationTable, getExecutedMigrations, runAllMigrations } from '../lib/db-utils'

async function main() {
  try {
    console.log('Creating migrations table if it does not exist...')
    const tableCreated = await createMigrationTable()
    if (!tableCreated) {
      console.error('Failed to create migrations table')
      process.exit(1)
    }

    console.log('Getting executed migrations...')
    const executedMigrations = await getExecutedMigrations()
    console.log('Previously executed migrations:', executedMigrations)

    console.log('Running all migrations...')
    const success = await runAllMigrations()
    if (!success) {
      console.error('Migration failed')
      process.exit(1)
    }

    console.log('All migrations completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error running migrations:', error)
    process.exit(1)
  }
}

main() 