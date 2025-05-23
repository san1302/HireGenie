"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Check, Loader } from "lucide-react";
import { useToast } from "./ui/use-toast";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setEmail("");
      toast({
        title: "Success!",
        description: "You've been added to our waitlist.",
      });
      
      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };

  return (
    <section id="waitlist" className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Join the Waitlist
              </h2>
              <p className="text-white/80 mb-6">
                Be the first to know when HireGenie launches. Early access members receive exclusive benefits and priority support.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-1 rounded-full">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90 text-sm">
                    Early access to all premium features
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-1 rounded-full">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90 text-sm">
                    30% discount on launch pricing
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-1 rounded-full">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90 text-sm">
                    Personalized onboarding assistance
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                    Your Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@example.com"
                    className="w-full bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white"
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  disabled={isSubmitting || isSuccess}
                  className={`w-full h-11 text-base font-medium ${
                    isSuccess 
                      ? "bg-green-500 hover:bg-green-600" 
                      : "bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      You're on the list!
                    </>
                  ) : (
                    "Join Waitlist"
                  )}
                </Button>
              </form>
              
              <div className="mt-6 flex items-center justify-center">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"
                      style={{
                        backgroundImage: `url(https://i.pravatar.cc/100?img=${30+i})`,
                        backgroundSize: 'cover'
                      }}
                    />
                  ))}
                </div>
                <div className="ml-3">
                  <p className="text-white/90 text-sm">
                    Join <span className="font-semibold">1,240+</span> others waiting for access
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 