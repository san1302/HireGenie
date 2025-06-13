"use client";

import { supabase } from "../../supabase/supabase";
import { Button } from "./ui/button";
import { User } from "@supabase/supabase-js";
import { Check, Loader2, Crown, Settings } from "lucide-react";
import { useState } from "react";
import { useToast } from "./ui/use-toast";
import Link from "next/link";

export default function PricingCard({
  item,
  user,
  userSubscription,
  isCurrentPlan,
}: {
  item: any;
  user: User | null;
  userSubscription?: any;
  isCurrentPlan?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Handle checkout process
  const handleCheckout = async (priceId: string) => {
    console.log("priceId", priceId);
    if (!priceId) {
      toast({
        title: "Error",
        description: "Invalid price ID",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      // Redirect to login if user is not authenticated
      window.location.href = "/sign-in";
      return;
    }

    setIsLoading(true);

    try {
      const checkoutPayload = {
        productPriceId: priceId,
        successUrl: `${window.location.origin}/dashboard`,
        customerEmail: user.email || "",
        metadata: {
          user_id: user.id,
        },
      };

      console.log("🔍 CHECKOUT DEBUG - User object:", JSON.stringify(user, null, 2));
      console.log("🔍 CHECKOUT DEBUG - Sending payload:", JSON.stringify(checkoutPayload, null, 2));
      console.log("🔍 CHECKOUT DEBUG - User ID being sent:", user.id);

      // Temporary debugging alert
      alert(`DEBUG: Sending user_id: ${user.id} (type: ${typeof user.id})`);

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: checkoutPayload,
          headers: {
            "X-Customer-Email": user.email || "",
          },
        },
      );

      console.log("🔍 CHECKOUT DEBUG - Response:", JSON.stringify({ data, error }, null, 2));

      if (error) {
        throw error;
      }
      console.log("🔍 CHECKOUT DEBUG - Data:", data);
      // Redirect to Polar checkout
      if (data?.url) {
        console.log("🔍 CHECKOUT DEBUG - Redirecting to:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Checkout Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const isPopular = item.name === "Pro";
  const isPremium = item.name === "Lifetime";
  const price = item?.prices?.[0]?.priceAmount / 100;

  // Determine button state based on subscription status
  const getButtonConfig = () => {
    if (isCurrentPlan) {
      return {
        text: "Go to Dashboard",
        href: "/dashboard",
        variant: "secondary",
        disabled: false,
        isLink: true,
        icon: null
      };
    }

    if (!user) {
      return {
        text: isPremium ? "Get Lifetime Access" : "Get Started",
        href: "/sign-in",
        variant: "primary",
        disabled: false,
        isLink: true,
        icon: null
      };
    }

    // User is authenticated but doesn't have this plan
    return {
      text: isPremium ? "Get Lifetime Access" : "Get Started",
      href: null,
      variant: "primary",
      disabled: false,
      isLink: false,
      icon: null
    };
  };

  const buttonConfig = getButtonConfig();

  // Determine card styling based on plan type
  const getCardStyling = () => {
    if (isPremium) {
      return {
        cardClass: "shadow-lg hover:shadow-xl border-2 border-indigo-200",
        backgroundOverlay: "bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-40",
        priceClass: "bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent",
        checkBg: "bg-gradient-to-r from-indigo-100 to-purple-100",
        checkIcon: "text-indigo-600",
        buttonClass: isCurrentPlan 
          ? "bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 text-blue-700 border-0"
          : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg"
      };
    } else if (isPopular) {
      return {
        cardClass: "shadow-lg hover:shadow-xl border border-blue-200",
        backgroundOverlay: "bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-40",
        priceClass: "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
        checkBg: "bg-gradient-to-r from-blue-100 to-purple-100",
        checkIcon: "text-blue-600",
        buttonClass: isCurrentPlan 
          ? "bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 text-blue-700 border-0"
          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
      };
    } else {
      return {
        cardClass: "shadow-lg hover:shadow-xl border border-gray-200",
        backgroundOverlay: "",
        priceClass: "text-gray-900",
        checkBg: "bg-gray-100",
        checkIcon: "text-gray-600",
        buttonClass: "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-900 border-0"
      };
    }
  };

  const styling = getCardStyling();

  return (
    <div className={`relative bg-white rounded-3xl p-8 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col ${styling.cardClass}`}>
      {/* Background overlay */}
      {styling.backgroundOverlay && (
        <div className={`absolute inset-0 ${styling.backgroundOverlay} rounded-3xl`}></div>
      )}
      
      {/* Premium badge for Lifetime */}
      {isPremium && (
        <div className="absolute -top-3 -right-3 z-10">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-2 rounded-full shadow-lg">
            <Crown className="w-4 h-4" />
          </div>
        </div>
      )}
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header section - fixed height */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.name}</h3>
          <div className="flex items-baseline mb-4">
            <span className={`text-5xl font-bold ${styling.priceClass}`}>
              ${price}
            </span>
            <span className="text-gray-500 ml-2 text-lg">
              {isPremium ? "/one-time" : "/month"}
            </span>
          </div>
          <p className="text-gray-600 h-12 flex items-center">
            {isPremium ? "Ultimate value with lifetime access" : 
             isPopular ? "Most popular choice for professionals" : 
             "Great for getting started"}
          </p>
        </div>
        
        {/* Features section - flexible height */}
        {item.description && (
          <div className="border-t border-gray-100 pt-8 mb-8 flex-1">
            <ul className="space-y-4">
              {item.description.split("\n").map((desc: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${styling.checkBg}`}>
                    <Check className={`w-4 h-4 ${styling.checkIcon}`} />
                  </div>
                  <span className="text-gray-700 font-medium leading-relaxed">{desc.trim()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Button section - fixed at bottom */}
        <div className="mt-auto">
          {buttonConfig.isLink ? (
            <Button
              asChild
              size="lg"
              className={`w-full font-semibold py-6 text-lg transition-all duration-200 ${styling.buttonClass}`}
              disabled={buttonConfig.disabled}
            >
              <Link href={buttonConfig.href!}>{buttonConfig.text}</Link>
            </Button>
          ) : (
            <Button
              onClick={async () => {
                await handleCheckout(item?.prices?.[0]?.productId);
              }}
              disabled={isLoading || buttonConfig.disabled}
              size="lg"
              className={`w-full font-semibold py-6 text-lg transition-all duration-200 ${styling.buttonClass}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                buttonConfig.text
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
