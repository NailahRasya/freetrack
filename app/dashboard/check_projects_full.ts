import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
  const { data, error } = await supabase.from("projects").select("*").limit(1);
  if (data && data.length > 0) {
    console.log("Full Projects Columns:", Object.keys(data[0]));
  } else {
    console.log("No projects found or error:", error);
  }
}

check();
