import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://tlzsbmmojmrmtghaulwb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsenNibW1vam1ybXRnaGF1bHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY4NjY4MSwiZXhwIjoyMDkyMjYyNjgxfQ.lgQjT6RjVqsH4GcKQ__eESeVJ6ax7gBg1QeVBdws0Ow"
);

async function run() {
  const { data: p, error } = await supabase.from("profiles").select("*").limit(2);
  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }
  console.log("Profiles columns:", Object.keys(p[0] || {}));
  console.log("Profiles sample:", p);
}

run();
