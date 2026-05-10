import { NextResponse } from 'next/server'
// The client you created in Step 1
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role') ?? 'client'
  
  // if "next" is in search params, use it as the redirection URL
  // Default to /dashboard if next is not provided
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log("🔑 Auth Callback - Code Exchange:", error ? "FAILED" : "SUCCESS");

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      const redirectPath = next.startsWith('/dashboard') ? `${next}?role=${role}` : next
      console.log("🚀 Auth Callback - Redirecting to:", redirectPath);

      if (isLocalEnv) {
        return NextResponse.redirect(new URL(redirectPath, origin))
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        return NextResponse.redirect(new URL(redirectPath, origin))
      }
    } else {
      console.error("❌ Auth Callback - Error:", error.message);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-error`)
}
