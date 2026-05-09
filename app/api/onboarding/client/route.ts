import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  console.log("Onboarding Client API called for user:", user.id, "Data:", body);
  const { 
    projectCategories, 
    businessScale,
    workType,
    experiencePreference,
    requiredSkills, 
  } = body;

  try {
    // 1. Save detailed onboarding data (Personalization only)
    const { error: onboardingError } = await supabase
      .from("onboarding_client")
      .insert({
        user_id: user.id,
        project_categories: projectCategories,
        required_skills: requiredSkills,
        business_scale: businessScale,
        work_type: workType,
        experience_preference: experiencePreference
      });

    if (onboardingError) throw onboardingError;

    // 2. Update profile with interest categories for matching
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ 
        onboarding_completed: true,
        skills: projectCategories, // Use categories as skills for matching
      })
      .eq("id", user.id);

    if (profileError) throw profileError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
