"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useCallback } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const plan = searchParams.get("plan");
  const [countdown, setCountdown] = useState(5);
  const [isPolling, setIsPolling] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'checking' | 'found' | 'not_found'>('checking');

  // Enhanced subscription polling
  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/check-subscription');
      if (response.ok) {
        const data = await response.json();
        if (data.hasActiveSubscription) {
          setSubscriptionStatus('found');
          setIsPolling(false);
          // Immediate redirect when subscription is found
          window.location.href = '/dashboard';
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }, []);

  // Polling effect for subscription status
  useEffect(() => {
    if (!isPolling) return;

    let pollCount = 0;
    const maxPolls = 15; // Poll for 30 seconds (2s interval)

    const pollInterval = setInterval(async () => {
      pollCount++;
      const found = await checkSubscriptionStatus();
      
      if (found || pollCount >= maxPolls) {
        clearInterval(pollInterval);
        setIsPolling(false);
        if (!found) {
          setSubscriptionStatus('not_found');
        }
      }
    }, 2000); // Poll every 2 seconds

    // Initial check
    checkSubscriptionStatus();

    return () => {
      clearInterval(pollInterval);
    };
  }, [checkSubscriptionStatus, isPolling]);

  // Original countdown effect (as fallback)
  useEffect(() => {
    if (redirect === "dashboard" && !isPolling) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = "/dashboard";
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [redirect, isPolling]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Payment Successful!</CardTitle>
          <CardDescription>
            {plan ? `Welcome to the ${plan} plan! ` : ""}Thank you for your purchase. Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-center text-muted-foreground">
            You will receive a confirmation email shortly with your purchase details.
          </p>
          
          {/* Enhanced status indicators */}
          {isPolling && (
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <p className="text-sm text-blue-700 font-medium">
                  Activating your subscription...
                </p>
              </div>
              <p className="text-xs text-blue-600">
                We're setting up your account. This usually takes just a few seconds.
              </p>
            </div>
          )}

          {subscriptionStatus === 'found' && (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-medium mb-1">
                🎉 Subscription activated!
              </p>
              <p className="text-xs text-green-600">
                Redirecting you to the dashboard...
              </p>
            </div>
          )}

          {subscriptionStatus === 'not_found' && redirect === "dashboard" && countdown > 0 && (
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 mb-2">
                🎉 Get ready to create amazing cover letters!
              </p>
              <p className="text-xs text-blue-600">
                Redirecting to dashboard in {countdown} seconds...
              </p>
            </div>
          )}
          
          <div className="flex gap-4 w-full">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Return Home</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Manual refresh button if polling fails */}
          {subscriptionStatus === 'not_found' && !isPolling && (
            <Button 
              onClick={() => {
                setIsPolling(true);
                setSubscriptionStatus('checking');
              }}
              variant="ghost"
              size="sm"
              className="text-blue-600"
            >
              Check Status Again
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </main>
      }>
        <SuccessContent />
      </Suspense>
    </>
  );
}
