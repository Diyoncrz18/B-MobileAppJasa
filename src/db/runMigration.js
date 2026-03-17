/**
 * Run migration.sql directly against Supabase PostgreSQL
 * Uses the Supabase Management API's SQL endpoint
 */
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

async function runMigration() {
  const sql = fs.readFileSync(path.join(__dirname, 'migration.sql'), 'utf-8');
  
  console.log('📦 Running migration SQL via Supabase REST API…');
  
  // Use the pg_meta / SQL execution endpoint
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  // If rpc doesn't work, try the raw SQL approach via pg_meta
  if (!res.ok) {
    console.log('⚠️  RPC not available, trying direct SQL via pg_meta...');
    
    // Split SQL and run each statement individually via pg_meta
    const statements = sql.split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let success = 0;
    let failed = 0;

    for (const stmt of statements) {
      try {
        const stmtRes = await fetch(`${SUPABASE_URL}/pg`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
          },
          body: JSON.stringify({ query: stmt + ';' }),
        });
        
        if (stmtRes.ok) {
          success++;
        } else {
          failed++;
          const label = stmt.substring(0, 60).replace(/\n/g, ' ');
          console.log(`  ⚠️  ${label}…`);
        }
      } catch (err) {
        failed++;
      }
    }

    if (failed > 0) {
      console.log(`\n⚠️  ${failed} statements failed via API.`);
      console.log('📋 Please run migration.sql manually in the Supabase SQL Editor:');
      console.log(`   ${SUPABASE_URL.replace('.supabase.co', '')}/project/default/sql`);
      console.log('   Or open: Supabase Dashboard → SQL Editor → New Query → paste migration.sql → Run');
    }
    
    if (success > 0) {
      console.log(`✅ ${success} statements executed successfully.`);
    }
  } else {
    console.log('✅ Migration complete!');
  }
}

runMigration().catch(err => {
  console.error('💥', err.message);
  process.exit(1);
});
