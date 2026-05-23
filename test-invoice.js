const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Env variables not found!');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function run() {
  // 1. Get a milestone
  const { data: milestone, error: milestoneError } = await supabaseAdmin
    .from("milestones")
    .select("*")
    .limit(1)
    .single();

  if (milestoneError || !milestone) {
    console.error("❌ Milestone fetch error:", milestoneError);
    return;
  }
  console.log("Found milestone ID:", milestone.id);

  // 2. Try to insert an invoice
  const { data: invoice, error: insertError } = await supabaseAdmin
    .from("invoices")
    .insert({
      invoice_number: `TEST-INV-${Date.now()}`,
      project_id: milestone.project_id,
      milestone_id: milestone.id,
      client_id: milestone.client_id,
      freelancer_id: milestone.freelancer_id,
      project_title: "Test Project",
      milestone_title: milestone.title,
      client_name: "Test Client",
      freelancer_name: "Test Freelancer",
      amount: milestone.amount || 0,
      status: "paid",
      paid_at: new Date().toISOString(),
      due_date: new Date().toISOString(),
    });

  if (insertError) {
    console.error("❌ INVOICE INSERT ERROR:", insertError);
  } else {
    console.log("✅ INVOICE INSERT SUCCESS:", invoice);
  }
}

run();
