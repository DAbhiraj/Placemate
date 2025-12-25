import { pool } from './db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Running migration: 003_change_date_to_timestamp.sql');
    
    const migrationPath = path.join(__dirname, 'migrations', '003_change_date_to_timestamp.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Verifying changes...');
    
    // Verify the change
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' 
      AND column_name IN ('application_deadline', 'online_assessment_date')
      ORDER BY column_name
    `);
    
    console.log('📋 Column types after migration:');
    result.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
