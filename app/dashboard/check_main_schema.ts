import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
  const { data: profileData } = await supabase.from("profiles").select("*").limit(1);
  const { data: projectData } = await supabase.from("projects").select("*").limit(1);

  console.log("Profiles Columns:", profileData ? Object.keys(profileData[0] || {}) : "Empty");
  console.log("Projects Columns:", projectData ? Object.keys(projectData[0] || {}) : "Empty");
}

check();
