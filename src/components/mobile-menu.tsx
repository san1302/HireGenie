"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "../../supabase/client";
import { 
  User, 
  LogOut, 
  Settings, 
  FileText, 
  Crown, 
  Sparkles,
  Home,
  Plus,
  BarChart3,
  UserCircle
} from "lucide-react";
import { Badge } from "./ui/badge";

interface UserSubscription {
  hasActiveSubscription: boolean;
  planDetails?: {
    planName: string;
  };
}

interface MobileMenuProps {
  user: any;
}

export default function MobileMenu({ user }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const checkUserSubscription = useCallback(async (userId: string) => {
    try {
      console.log('Mobile menu - Checking subscription for user ID:', userId); // Debug log
      
      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .select("status") // Remove plan_name column
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

      console.log('Mobile menu - Subscription query result:', { subscription, error }); // Debug log

      if (error) {
        console.error('Error checking subscription:', error);
        return { hasActiveSubscription: false };
      }

      return {
        hasActiveSubscription: !!subscription,
        planDetails: subscription ? { planName: "Pro" } : { planName: "Free" } // Simple logic
      };
    } catch (error) {
      console.error('Unexpected error in mobile menu subscription check:', error);
      return { hasActiveSubscription: false };
    }
  }, [supabase]);

  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (user?.id) {
        const subscriptionInfo = await checkUserSubscription(user.id);
        setUserSubscription(subscriptionInfo);
      }
      setIsLoading(false);
    };

    fetchUserSubscription();
  }, [user?.id, checkUserSubscription]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    closeMenu();
  };

  // Navigation items for authenticated users
  const dashboardNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard#generate', label: 'Generate Cover Letter', icon: Plus },
    { href: '/dashboard/history', label: 'History', icon: FileText },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  // Public navigation items
  const publicNavItems = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How it Works' },
    { href: '#pricing', label: 'Pricing' },
  ];

  const planBadge = userSubscription?.hasActiveSubscription 
    ? { text: 'Pro Plan', variant: 'pro', icon: Crown }
    : { text: 'Free Plan', variant: 'free', icon: Sparkles };

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="hover:bg-gray-100 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle mobile menu"
      >
        <UserCircle className="h-6 w-6" />
      </Button>
      
      {/* Mobile menu dropdown */}
      <div className={`absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-3 transition-all duration-200 z-50 ${
        isOpen ? 'opacity-100 visible transform scale-100' : 'opacity-0 invisible transform scale-95'
      }`}>
        
        {user ? (
          <>
            {/* User info section */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.email}
                  </p>
                  {!isLoading && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs mt-1 ${
                        planBadge.variant === 'pro' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      <planBadge.icon className="h-3 w-3 mr-1" />
                      {planBadge.text}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Dashboard navigation */}
            <div className="py-2">
              {dashboardNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={closeMenu}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-gray-100 py-2">
              <Link 
                href="/dashboard/settings" 
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                onClick={closeMenu}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              
              {/* Subscription management */}
              {userSubscription?.hasActiveSubscription ? (
                <Link 
                  href="/dashboard/settings#subscription" 
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  onClick={closeMenu}
                >
                  <Crown className="h-4 w-4" />
                  Manage Subscription
                </Link>
              ) : (
                <Link 
                  href="/pricing" 
                  className="flex items-center gap-3 px-4 py-2 text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  onClick={closeMenu}
                >
                  <Crown className="h-4 w-4" />
                  Upgrade to Pro
                </Link>
              )}
            </div>

            <div className="border-t border-gray-100 py-2">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Authentication options for non-logged-in users */}
            <div className="py-2">
              <Link 
                href="/sign-in" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                onClick={closeMenu}
              >
                Sign In
              </Link>
              <Link 
                href="/sign-up" 
                className="block px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium transition-colors duration-200"
                onClick={closeMenu}
              >
                Get Started Free
              </Link>
            </div>

            <div className="border-t border-gray-100 py-2">
              {publicNavItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}