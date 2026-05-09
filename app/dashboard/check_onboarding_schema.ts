import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
  const { data, error } = await supabase.from("onboarding_client").select("*").limit(1);
  if (data && data.length > 0) {
    console.log("Onboarding Client Columns:", Object.keys(data[0]));
  } else {
    console.log("No data or error:", error?.message);
  }
}

check();
