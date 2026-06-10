const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
let supabaseUrl = '';
let supabaseServiceRoleKey = '';

try {
  const envPath = path.resolve('.env.local');
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
  console.error("Failed to parse env:", err);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, description, status, freelancer_id, client_id");

  if (error) {
    console.error("Error fetching projects:", error);
  } else {
    console.log(`Fetched ${data.length} projects:`);
    data.forEach(p => {
      console.log(`- ID: ${p.id}\n  Title: ${p.title}\n  Status: ${p.status}\n  Description: ${p.description}\n`);
    });
  }
}

run();
