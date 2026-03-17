const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    '⚠️  SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diset di .env'
  );
}

// Admin client — bypass RLS, digunakan untuk operasi backend
const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Public client — menggunakan anon key, untuk verifikasi auth token
const supabasePublic = createClient(supabaseUrl || '', supabaseAnonKey || '');

module.exports = { supabaseAdmin, supabasePublic, supabaseUrl, supabaseAnonKey };
