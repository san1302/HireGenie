import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import { api } from "@/lib/polar";
import { createClient } from "../../../supabase/server";

export default async function Pricing() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log(user);
    const { data: plans, error } = await supabase.functions.invoke('supabase-functions-get-plans');
    const result = plans?.items;
    console.log("prices", result[0].prices);

    return (
        <>
            <Navbar />
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
                    <p className="text-xl text-muted-foreground">
                        Choose the perfect plan for your needs
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {result?.map((item: any) => (
                        <PricingCard key={item.id} item={item} user={user} />
                    ))}
                </div>
            </div>
        </>
    );
}