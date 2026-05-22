const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
let supabaseUrl = '';
let supabaseServiceRoleKey = '';

try {
  const envPath = path.resolve(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index === -1) continue;
      const key = trimmed.substring(0, index).trim();
      const val = trimmed.substring(index + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseServiceRoleKey = val;
    }
  }
} catch (err) {
  console.error("Failed to parse .env.local manually:", err);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key defined:', !!supabaseServiceRoleKey);

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Env variables not found!');
  process.exit(1);
}

try {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('Supabase client successfully initialized!');

  async function run() {
    const { data: freelancers, error } = await supabase
      .from("onboarding_freelancer")
      .select("*")
      .limit(1);

    if (error) {
      console.error("❌ ERROR FETCHING FREELANCER:", error);
    } else {
      console.log("✅ Freelancer Preference Sample:");
      console.log(JSON.stringify(freelancers[0], null, 2));
    }
  }

  run();

} catch (err) {
  console.error('Initialization error:', err);
}
