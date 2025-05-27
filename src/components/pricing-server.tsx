import PricingCard from "@/components/pricing-card";
import { createClient } from "../../supabase/server";
import { Check } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

export default async function PricingServer() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: plans, error } = await supabase.functions.invoke('supabase-functions-get-plans');
    const result = plans?.items;
    console.log("plans", result);
    if (error) {
        console.error("Error fetching plans:", error);
        return (
            <div className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Live Pricing</h2>
                        <p className="text-gray-600 mt-2">Unable to load pricing plans at this time</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-16 bg-gray-50 border-t border-gray-100">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <span className="bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full font-medium">Live Pricing</span>
                    <h2 className="text-3xl font-bold text-gray-900 mt-4">Our Current Plans</h2>
                    <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                        These are our actual subscription plans with direct checkout
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 p-8 flex flex-col h-full transform hover:-translate-y-1 transition-transform">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Free</h3>
                            <div className="flex items-baseline mb-2">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-gray-500 ml-1">/forever</span>
                            </div>
                            <p className="text-gray-500 text-sm">Perfect for occasional job seekers</p>
                        </div>
                        
                        <div className="border-t border-gray-100 pt-6 mb-6">
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-600">
                                        <span className="font-medium">2 cover letters</span> per month
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-600">
                                        <span className="font-medium">Basic templates</span>
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-600">
                                        <span className="font-medium">Standard</span> export options
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-600">
                                        <span className="font-medium">Community</span> support
                                    </span>
                                </li>
                            </ul>
                        </div>
                        
                        <Button 
                            asChild 
                            variant="outline"
                            className="w-full bg-white hover:bg-gray-50 border-gray-200 text-gray-800"
                        >
                            <Link href="/sign-up">Get Started Free</Link>
                        </Button>
                    </div>

                    {result?.map((item: any) => (
                        <PricingCard key={item.id} item={item} user={user} />
                    ))}
                </div>
            </div>
        </div>
    );
} 