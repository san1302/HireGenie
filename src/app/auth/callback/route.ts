import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect_to = requestUrl.searchParams.get("redirect_to");

  if (code) {
    const supabase = await createClient();
    
    // Exchange code for session
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth callback error:', error);
      // Redirect to sign-in with error
      return NextResponse.redirect(new URL('/sign-in?message=Authentication failed', requestUrl.origin));
    }

    // If user exists and this is from OAuth, ensure user record exists in our database
    if (user) {
      try {
        // Check if user already exists in our users table
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        // If user doesn't exist, create them (important for OAuth users)
        if (!existingUser && !fetchError) {
          const fullName = user.user_metadata?.full_name || 
                          user.user_metadata?.name || 
                          user.email?.split('@')[0] || 
                          'User';

          const { error: insertError } = await supabase.from("users").insert({
            id: user.id,
            name: fullName,
            full_name: fullName,
            email: user.email,
            user_id: user.id,
            token_identifier: user.id,
            created_at: new Date().toISOString(),
          });

          if (insertError) {
            console.error("Error creating user profile for OAuth user:", insertError);
            // Don't block the auth flow, but log the error
          }
        }
      } catch (err) {
        console.error("Error in OAuth user profile creation:", err);
        // Don't block the auth flow, but log the error
      }
    }
  }

  // URL to redirect to after sign in process completes
  const redirectTo = redirect_to || "/dashboard";
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
} 