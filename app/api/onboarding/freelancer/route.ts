import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
  }

  try {
    // Gunakan service role key untuk bypass RLS
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from("onboarding_freelancer")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { 
    skillCategories, 
    tools, 
    experienceLevel, 
    yearsOfExperience, 
    portfolioUrl,
    preferredClientScales,
    workTypePreference,
    city,
    country,
    billingRate,
    billingType
  } = body;

  try {
    // 1. Save detailed onboarding data
    const { error: onboardingError } = await supabase
      .from("onboarding_freelancer")
      .insert({
        user_id: user.id,
        skill_categories: skillCategories,
        tools: tools,
        experience_level: experienceLevel,
        years_of_experience: yearsOfExperience,
        portfolio_url: portfolioUrl,
        preferred_client_scales: preferredClientScales,
        work_type_preference: workTypePreference,
        city: city,
        country: country,
        billing_rate: billingRate,
        billing_type: billingType
      });

    if (onboardingError) throw onboardingError;

    // 2. Update profile with detailed info and mark onboarding as completed
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ 
        onboarding_completed: true,
        skills: skillCategories,
        tools: tools,
        experience_level: experienceLevel,
        years_of_experience: yearsOfExperience,
        portfolio_url: portfolioUrl,
        city: city,
        country: country,
        billing_rate: billingRate,
        billing_type: billingType
      })
      .eq("id", user.id);

    if (profileError) throw profileError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
