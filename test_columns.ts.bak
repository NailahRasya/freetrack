import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
  // Try snake_case
  const { data, error } = await supabase.from("onboarding_client").select("business_scale, work_type, experience_preference").limit(1);
  if (error) {
    console.log("Snake case failed:", error.message);
    // Try camelCase just to be 100% sure why it failed
    const { error: error2 } = await supabase.from("onboarding_client").select("businessScale").limit(1);
    console.log("Camel case error:", error2?.message);
  } else {
    console.log("Snake case worked!");
  }
}

check();
