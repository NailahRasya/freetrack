import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function debug() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { console.log("No User Logged In"); return; }

  const { data: clientPref } = await supabase
    .from("onboarding_client")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  console.log("Your (Client) Prefs:", clientPref);

  const { data: freelancers } = await supabase
    .from("profiles")
    .select(`*, onboarding:onboarding_freelancer(*)`)
    .eq("role", "freelancer");

  console.log("Total Freelancers Found:", freelancers?.length || 0);

  if (freelancers) {
    freelancers.forEach(f => {
      console.log(`Freelancer: ${f.full_name}, Onboarding Data:`, f.onboarding?.length > 0 ? "Exists" : "Empty");
    });
  }
}

debug();
