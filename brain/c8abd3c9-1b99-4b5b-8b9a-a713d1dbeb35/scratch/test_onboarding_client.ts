import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://tlzsbmmojmrmtghaulwb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsenNibW1vam1ybXRnaGF1bHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY4NjY4MSwiZXhwIjoyMDkyMjYyNjgxfQ.lgQjT6RjVqsH4GcKQ__eESeVJ6ax7gBg1QeVBdws0Ow"
);

async function run() {
  const { data: ob, error } = await supabase
    .from("onboarding_client")
    .select("*")
    .eq("user_id", "dfb7dd08-2f2c-4533-a391-b16558bd09df")
    .maybeSingle();

  if (error) {
    console.error("Error fetching onboarding_client:", error);
    return;
  }
  console.log("onboarding_client:", ob);
}

run();
