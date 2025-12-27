import { pool } from './db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAll() {
  try {
    const dir = path.join(__dirname, 'migrations');
    const files = (await fs.readdir(dir))
      .filter(f => f.endsWith('.sql'))
      .sort();
    console.log('🔄 Running migrations:', files.join(', '));
    for (const file of files) {
      const sql = await fs.readFile(path.join(dir, file), 'utf8');
      console.log(`➡️ Applying ${file}`);
      await pool.query(sql);
    }
    console.log('✅ All migrations applied');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
}

runAll();
