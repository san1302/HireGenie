import PricingCard from "@/components/pricing-card";
import { createClient } from "../../supabase/server";
import { Check } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { checkUserSubscription } from "@/app/actions";

export default async function PricingServer() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: plans, error } = await supabase.functions.invoke('supabase-functions-get-plans');
    const result = plans?.items;
    console.log("plans", result);
    
    // Get user subscription status if authenticated
    let userSubscription = null;
    if (user) {
        const subscriptionResult = await checkUserSubscription(user.id);
        if (subscriptionResult.success && subscriptionResult.hasActiveSubscription) {
            userSubscription = subscriptionResult;
        }
    }
    
    if (error) {
        console.error("Error fetching plans:", error);
        return (
            <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-600 text-sm font-medium mb-8">
                            ⚠️ Unable to Load Plans
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Pricing</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            We're experiencing technical difficulties. Please try refreshing the page.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // Sort plans to put Pro first, then others
    const sortedPlans = result ? [...result].sort((a, b) => {
        if (a.name === "Pro") return -1; // Pro comes first
        if (b.name === "Pro") return 1;  // Pro comes first
        return a.name.localeCompare(b.name); // Alphabetical for others
    }) : [];

    // Determine Free plan button state
    const getFreeCardButton = () => {
        if (!user) {
            return {
                text: "Get Started Free",
                href: "/sign-up",
                disabled: false,
                variant: "default"
            };
        }
        
        if (userSubscription) {
            return {
                text: "Go to Dashboard",
                href: "/dashboard",
                disabled: false,
                variant: "secondary"
            };
        }
        
        return {
            text: "Go to Dashboard",
            href: "/dashboard",
            disabled: false,
            variant: "default"
        };
    };

    const freeCardButton = getFreeCardButton();

    return (
        <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6" aria-hidden="true">
                <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30" 
                     style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}></div>
            </div>

            <div className="container mx-auto px-4 relative">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-medium mb-8">
                        🚀 Live Pricing
                    </div>
                    <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
                        Choose Your Plan
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        {userSubscription 
                            ? `You're currently on the ${userSubscription.planDetails?.planName || 'Pro'} plan` 
                            : "Get started with our free plan or upgrade to unlock unlimited cover letters and premium features"}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
                    {/* Free Plan - Always first */}
                    <div className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-slate-200 rounded-3xl blur opacity-60 group-hover:opacity-80 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                        <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 border border-gray-200 h-full flex flex-col">
                            {/* Current plan indicator */}
                            {user && !userSubscription && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg border border-white/20">
                                        Current Plan
                                    </div>
                                </div>
                            )}
                            
                            {/* Subtle background overlay for Free */}
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-slate-50 opacity-30 rounded-3xl"></div>
                            
                            <div className="relative z-10 flex flex-col h-full">
                                {/* Header section - fixed height */}
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
                                    <div className="flex items-baseline mb-4">
                                        <span className="text-5xl font-bold text-gray-900">$0</span>
                                        <span className="text-gray-500 ml-2 text-lg">/forever</span>
                                    </div>
                                    <p className="text-gray-600 h-12 flex items-center">Perfect for occasional job seekers</p>
                                </div>
                                
                                {/* Features section - flexible height */}
                                <div className="border-t border-gray-100 pt-8 mb-8 flex-1">
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <span className="text-gray-700 font-medium leading-relaxed">
                                                <span className="font-semibold">2 cover letters</span> per month
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <span className="text-gray-700 font-medium leading-relaxed">
                                                <span className="font-semibold">Basic templates</span>
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <span className="text-gray-700 font-medium leading-relaxed">
                                                <span className="font-semibold">Standard</span> export options
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <span className="text-gray-700 font-medium leading-relaxed">
                                                <span className="font-semibold">Community</span> support
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                                
                                {/* Button section - fixed at bottom */}
                                <div className="mt-auto">
                                    <Button 
                                        asChild 
                                        size="lg"
                                        className={`w-full font-semibold py-6 text-lg transition-all duration-200 ${
                                            freeCardButton.variant === "secondary" 
                                                ? "bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 text-blue-700 border-0"
                                                : "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 border-0"
                                        }`}
                                        disabled={freeCardButton.disabled}
                                    >
                                        <Link href={freeCardButton.href}>{freeCardButton.text}</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Plans from Polar */}
                    {sortedPlans?.map((item: any, index: number) => {
                        const isPopular = item.name === "Pro";
                        const isCurrentPlan = userSubscription?.planDetails?.planName === item.name;
                        
                        return (
                            <div key={item.id} className="group relative">
                                {isCurrentPlan && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg border border-white/20">
                                            Current Plan
                                        </div>
                                    </div>
                                )}
                                {isPopular && !isCurrentPlan && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                                            Most Popular
                                        </div>
                                    </div>
                                )}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 to-purple-200 rounded-3xl blur opacity-60 group-hover:opacity-80 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                                <div className="relative">
                                    <PricingCard 
                                        item={item} 
                                        user={user} 
                                        userSubscription={userSubscription}
                                        isCurrentPlan={isCurrentPlan}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Enterprise Section */}
                <div className="mt-20 text-center">
                    <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-3xl p-12 shadow-2xl">
                        <h3 className="text-3xl font-bold text-white mb-4">Need something custom?</h3>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Looking for enterprise features, custom integrations, or volume pricing? Let's talk.
                        </p>
                        <Button 
                            asChild
                            size="lg"
                            className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-6 text-lg"
                        >
                            <Link href="mailto:san@san-verse.com">Contact Sales</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
} 