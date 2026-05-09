import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
  const { data: clientData } = await supabase.from("onboarding_client").select("*").limit(1);
  const { data: freelancerData } = await supabase.from("onboarding_freelancer").select("*").limit(1);

  if (clientData && clientData.length > 0) {
    console.log("Onboarding Client Keys:", JSON.stringify(Object.keys(clientData[0])));
  }
  if (freelancerData && freelancerData.length > 0) {
    console.log("Onboarding Freelancer Keys:", JSON.stringify(Object.keys(freelancerData[0])));
  }
}

check();
