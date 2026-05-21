const dotenv = require('dotenv');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key defined:', !!supabaseServiceRoleKey);

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Env variables not found!');
  process.exit(1);
}

try {
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('Supabase client successfully initialized!');
} catch (err) {
  console.error('Initialization error:', err);
}
