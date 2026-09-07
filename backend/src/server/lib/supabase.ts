/**
 * Server-only Supabase client configuration
 * IMPORTANT: This file is backend-only. Never expose to frontend.
 * NEVER expose SUPABASE_SECRET_KEY to React/Vite/browser
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

// Validate required environment variables
const offlineMode = process.env.OFFLINE_MODE === 'true';
const SUPABASE_URL = process.env.SUPABASE_URL || (offlineMode ? 'http://127.0.0.1:54321' : undefined);
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || (offlineMode ? 'offline-development-key' : undefined);

if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL environment variable is not set');
  process.exit(1);
}

if (!SUPABASE_SECRET_KEY) {
  console.error('❌ SUPABASE_SECRET_KEY environment variable is not set');
  process.exit(1);
}

// Create Supabase client with service role (server-only)
export const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    persistSession: false,
  },
});

export default supabase;
