"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
import { Button } from "./ui/button";
import UserProfile from "./user-profile";
import Logo from "./logo";
import { useEffect, useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useResponsive } from "@/hooks/useResponsive";
import { ResponsiveWrapper, MobileOnly, DesktopOnly } from "@/components/responsive";
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isMobile } = useResponsive();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    // { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it Works" },
    { href: "#pricing", label: "Pricing" },
    // { href: "/about", label: "About" },
  ];

  if (isLoading) {
    return (
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="container-responsive">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" showText={true} href="/" />
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo */}
          <Logo size="md" showText={true} href="/" />

          {/* Desktop Navigation */}
          <DesktopOnly>
            <div className="flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors duration-200 relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>
          </DesktopOnly>

          {/* User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                <DesktopOnly>
                  <Link href="/dashboard">
                    <Button 
                      variant="ghost"
                      className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 touch-target"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 touch-target"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </DesktopOnly>
                <MobileOnly>
                  <Link href="/dashboard">
                    <Button 
                      size="sm"
                      variant="ghost"
                      className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 min-h-[44px] min-w-[44px]"
                    >
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                </MobileOnly>
              </>
            ) : (
              <ResponsiveWrapper
                mobileProps={{
                  showSignIn: false,
                  buttonSize: "sm",
                  spacing: "space-x-2"
                }}
                desktopProps={{
                  showSignIn: true,
                  buttonSize: "default",
                  spacing: "space-x-3"
                }}
              >
                <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                  {!isMobile && (
                    <Link href="/sign-in">
                      <Button 
                        variant="ghost" 
                        className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 touch-target"
                      >
                        Sign In
                      </Button>
                    </Link>
                  )}
                  <Link href="/sign-up">
                    <Button 
                      size={isMobile ? "sm" : "default"}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 touch-target min-h-[44px]"
                    >
                      {isMobile ? "Get Started" : "Get Started Free"}
                    </Button>
                  </Link>
                </div>
              </ResponsiveWrapper>
            )}

            {/* Mobile Menu Button */}
            <MobileOnly>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px] rounded-lg hover:bg-gray-100 transition-all duration-200"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </Button>
            </MobileOnly>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <MobileOnly>
        <div className={`fixed inset-0 z-40 transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          
          {/* Menu Panel */}
          <div className={`absolute top-16 sm:top-18 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg transform transition-all duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}>
            <div className="px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Navigation Links */}
              <div className="space-y-1 mb-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-4 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 min-h-[48px] flex items-center"
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Auth Actions */}
              <div className="border-t border-gray-200/50 pt-4 space-y-3">
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={closeMobileMenu}>
                      <Button 
                        variant="ghost"
                        className="w-full justify-start text-left font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 min-h-[48px] py-3 px-4"
                      >
                        <User className="w-5 h-5 mr-3" />
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Button
                      onClick={handleSignOut}
                      variant="ghost"
                      className="w-full justify-start text-left font-medium text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[48px] py-3 px-4"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/sign-in" onClick={closeMobileMenu}>
                      <Button 
                        variant="ghost"
                        className="w-full justify-center font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 min-h-[48px] py-3"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up" onClick={closeMobileMenu}>
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold min-h-[48px] py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Get Started Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </MobileOnly>
    </nav>
  );
}
