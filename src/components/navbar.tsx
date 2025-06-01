import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Button } from "./ui/button";
import UserProfile from "./user-profile";
import MobileMenu from "./mobile-menu";

export default async function Navbar() {
  const supabase = createClient();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            prefetch
            className="flex items-center space-x-2 group"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-200">
              HireGenie.io
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200"
            >
              How it Works
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200"
            >
              Pricing
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button 
                    variant="ghost" 
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                  >
                    Dashboard
                  </Button>
                </Link>
                <UserProfile />
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/sign-in">
                  <Button 
                    variant="ghost" 
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 hidden sm:inline-flex"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <MobileMenu user={user} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
