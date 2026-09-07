/**
 * Fix RLS Permissions for Service Role
 * 
 * This script grants necessary permissions to the service_role so that
 * the Node.js Express backend can perform CRUD operations.
 * 
 * RLS is ENABLED (secure) but service_role needs explicit grants.
 * 
 * Run with: npx tsx scripts/fix-rls-permissions.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

// Create client with service role (server-side only)
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

// SQL commands to grant permissions to service_role
const RLS_GRANT_STATEMENTS = [
  // Students table - full CRUD
  `GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO service_role;`,
  `GRANT USAGE ON SEQUENCE public.students_id_seq TO service_role;`,

  // Schools table - SELECT and INSERT
  `GRANT SELECT, INSERT ON public.schools TO service_role;`,
  `GRANT USAGE ON SEQUENCE public.schools_id_seq TO service_role;`,

  // Forms table - full CRUD
  `GRANT SELECT, INSERT, UPDATE, DELETE ON public.forms TO service_role;`,
  `GRANT USAGE ON SEQUENCE public.forms_id_seq TO service_role;`,

  // Notices table - full CRUD
  `GRANT SELECT, INSERT, UPDATE, DELETE ON public.notices TO service_role;`,
  `GRANT USAGE ON SEQUENCE public.notices_id_seq TO service_role;`,

  // Grievances table - full CRUD
  `GRANT SELECT, INSERT, UPDATE, DELETE ON public.grievances TO service_role;`,
  `GRANT USAGE ON SEQUENCE public.grievances_id_seq TO service_role;`,

  // Merit results table - full CRUD
  `GRANT SELECT, INSERT, UPDATE, DELETE ON public.merit_results TO service_role;`,
  `GRANT USAGE ON SEQUENCE public.merit_results_id_seq TO service_role;`,

  // Verification records table - full CRUD
  `GRANT SELECT, INSERT, UPDATE, DELETE ON public.verification_records TO service_role;`,
  `GRANT USAGE ON SEQUENCE public.verification_records_id_seq TO service_role;`,

  // Job applications table - full CRUD
  `GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_applications TO service_role;`,
  `GRANT USAGE ON SEQUENCE public.job_applications_id_seq TO service_role;`,
];

async function fixRLSPermissions() {
  console.log('🔧 Fixing RLS Permissions for Supabase Service Role...\n');

  // Test connection first
  console.log('📡 Testing Supabase connection...');
  const { data: healthCheck, error: connError } = await supabase
    .from('students')
    .select('count(*)')
    .limit(1);

  if (connError) {
    console.log(`⚠️  Connection test failed (expected): ${connError.message}`);
    console.log('   This is normal - permissions need to be granted first.\n');
  } else {
    console.log('✅ Already connected! Permissions may already be granted.\n');
  }

  console.log('📝 Executing RLS permission grants...\n');

  for (let i = 0; i < RLS_GRANT_STATEMENTS.length; i++) {
    const statement = RLS_GRANT_STATEMENTS[i];
    console.log(`[${i + 1}/${RLS_GRANT_STATEMENTS.length}] Executing: ${statement.substring(0, 80)}...`);

    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement,
      });

      if (error) {
        console.error(`   ❌ Error: ${error.message}`);
        // Don't exit on error - continue with next statement
      } else {
        console.log('   ✅ Executed successfully');
      }
    } catch (err: any) {
      // Note: supabase.rpc() might not exist, try raw execution
      console.log(`   ⚠️  Note: Direct SQL execution not available via rpc()`);
      console.log(`   You will need to run this in Supabase SQL Editor instead.`);
      break;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('RLS PERMISSION GRANT INSTRUCTIONS');
  console.log('='.repeat(70));
  console.log(`
1. Open your Supabase project: ${SUPABASE_URL}
2. Go to SQL Editor
3. Copy and paste these commands:

${RLS_GRANT_STATEMENTS.join('\n')}

4. Execute the SQL
5. Rerun this script to verify permissions are granted

Note: RLS remains ENABLED for security. Only the service_role gets access.
Anonymous/public users still cannot read/write to these tables.
`);

  console.log('✅ RLS permission script completed.\n');
}

fixRLSPermissions().catch(err => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
