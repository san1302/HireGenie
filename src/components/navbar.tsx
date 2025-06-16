"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
import { Button } from "./ui/button";
import UserProfile from "./user-profile";
import Logo from "./logo";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useResponsive } from "@/hooks/useResponsive";
import { ResponsiveWrapper, MobileOnly, DesktopOnly } from "@/components/responsive";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isMobile } = useResponsive();
  const supabase = createClient();

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

  const navigationItems = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it Works" },
    { href: "#pricing", label: "Pricing" },
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
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo size="md" showText={true} href="/" />

          {/* Desktop Navigation */}
          <DesktopOnly>
            <div className="flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </DesktopOnly>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button 
                    variant="ghost"
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 touch-target"
                  >
                    Dashboard
                  </Button>
                </Link>
                <UserProfile />
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
                        className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 touch-target"
                      >
                        Sign In
                      </Button>
                    </Link>
                  )}
                  <Link href="/sign-up">
                    <Button 
                      size={isMobile ? "sm" : "default"}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 touch-target"
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
                className="touch-target touch-feedback"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </MobileOnly>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <MobileOnly>
        <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          
          {/* Menu Panel */}
          <div className={`absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}>
            <div className="mobile-padding mobile-spacing">
              {/* Navigation Links */}
              <div className="py-4 space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200 touch-target"
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Auth Actions */}
              {!user && (
                <div className="border-t border-gray-200 pt-4 pb-2 space-y-2">
                  <Link href="/sign-in" onClick={closeMobileMenu}>
                    <Button 
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 touch-target"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up" onClick={closeMobileMenu}>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg touch-target"
                    >
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </MobileOnly>
    </nav>
  );
}
