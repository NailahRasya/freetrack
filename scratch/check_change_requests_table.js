const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log("Checking if change_requests table exists...");
  const { data, error } = await supabase.from("change_requests").select("*").limit(1);
  if (error) {
    console.error("Error fetching change_requests:", error.message);
  } else {
    console.log("Success! Table exists. Row sample:", data);
  }
}

check();
