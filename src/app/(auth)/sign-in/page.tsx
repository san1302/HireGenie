import { signInAction, signInWithGoogleAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import Navbar from "@/components/navbar";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleOAuthButton } from "@/components/google-oauth-button";
import Link from "next/link";

interface LoginProps {
  searchParams: Promise<Message & { returnTo?: string }>;
}

export default async function SignInPage({ searchParams }: LoginProps) {
  const params = await searchParams;
  const message = params;
  const returnTo = params.returnTo;

  if ("message" in message) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={message} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  className="text-primary font-medium hover:underline transition-all"
                  href={`/sign-up${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Google OAuth Button */}
            <GoogleOAuthButton 
              mode="signin" 
              returnTo={returnTo}
              formAction={signInWithGoogleAction}
            />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form className="flex flex-col space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-all"
                    href="/forgot-password"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Your password"
                  required
                  className="w-full"
                />
              </div>

              {/* Hidden input to pass returnTo parameter */}
              {returnTo && (
                <input type="hidden" name="returnTo" value={returnTo} />
              )}

              <SubmitButton
                className="w-full"
                pendingText="Signing in..."
                formAction={signInAction}
              >
                Sign in
              </SubmitButton>
            </form>

            <FormMessage message={message} />
          </div>
        </div>
      </div>
    </>
  );
}
