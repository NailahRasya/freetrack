const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAll() {
  console.log("Checking for ANY drafts in projects table...");
  const { data: drafts, error: dError } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "draft");

  if (dError) console.error("Drafts check error:", dError);
  else console.log("Total drafts found:", drafts.length, JSON.stringify(drafts, null, 2));

  console.log("\nChecking for profiles with onboarding_completed = false...");
  const { data: profiles, error: pError } = await supabase
    .from("profiles")
    .select("id, full_name, role, onboarding_completed")
    .eq("onboarding_completed", false);

  if (pError) console.error("Profiles check error:", pError);
  else console.log("Users still in onboarding:", profiles.length, JSON.stringify(profiles, null, 2));
}

checkAll();
