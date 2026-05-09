import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
  const { data: clientData, error: clientError } = await supabase.from("onboarding_client").select("*").limit(1);
  const { data: freelancerData, error: freelancerError } = await supabase.from("onboarding_freelancer").select("*").limit(1);

  console.log("Onboarding Client Columns:", clientData ? Object.keys(clientData[0] || {}) : "Empty Table");
  if (clientError) console.error("Client Error:", clientError);

  console.log("Onboarding Freelancer Columns:", freelancerData ? Object.keys(freelancerData[0] || {}) : "Empty Table");
  if (freelancerError) console.error("Freelancer Error:", freelancerError);
}

check();
