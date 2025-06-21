"use client";

import Link from "next/link";
import { Twitter, Linkedin, Github, Mail, Send, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail("");
      toast({
        title: "Thank you for subscribing!",
        description: "You'll now receive our newsletter with the latest updates.",
      });
    }, 1000);
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
          {/* Logo and about */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm sm:text-base">HG</span>
              </div>
              <div className="font-bold text-xl sm:text-2xl text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                HireGenie
              </div>
            </div>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 max-w-md">
              AI-powered cover letter generator that helps job seekers create personalized, 
              professional cover letters in seconds. Get more interviews and land your dream job.
            </p>
            {/* Social Links */}
            <div className="flex space-x-4 sm:space-x-6">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Connect on LinkedIn"
              >
                <Linkedin className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="View on GitHub"
              >
                <Github className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="font-semibold text-white text-base sm:text-lg mb-4 sm:mb-6">Product</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <Link
                  href="#features"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group py-2 px-2 -mx-2 rounded-lg hover:bg-gray-800 min-h-[44px] text-sm sm:text-base"
                >
                  <span>Features</span>
                  <ArrowRight className="ml-2 h-3 w-0 group-hover:w-3 transition-all opacity-0 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group py-2 px-2 -mx-2 rounded-lg hover:bg-gray-800 min-h-[44px] text-sm sm:text-base"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="ml-2 h-3 w-0 group-hover:w-3 transition-all opacity-0 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group py-2 px-2 -mx-2 rounded-lg hover:bg-gray-800 min-h-[44px] text-sm sm:text-base"
                >
                  <span>Pricing</span>
                  <ArrowRight className="ml-2 h-3 w-0 group-hover:w-3 transition-all opacity-0 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group py-2 px-2 -mx-2 rounded-lg hover:bg-gray-800 min-h-[44px] text-sm sm:text-base"
                >
                  <span>How It Works</span>
                  <ArrowRight className="ml-2 h-3 w-0 group-hover:w-3 transition-all opacity-0 group-hover:opacity-100" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Company Column */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="font-semibold text-white text-base sm:text-lg mb-4 sm:mb-6">Company</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group py-2 px-2 -mx-2 rounded-lg hover:bg-gray-800 min-h-[44px] text-sm sm:text-base"
                >
                  <span>Home</span>
                  <ArrowRight className="ml-2 h-3 w-0 group-hover:w-3 transition-all opacity-0 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group py-2 px-2 -mx-2 rounded-lg hover:bg-gray-800 min-h-[44px] text-sm sm:text-base"
                >
                  <span>About</span>
                  <ArrowRight className="ml-2 h-3 w-0 group-hover:w-3 transition-all opacity-0 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group py-2 px-2 -mx-2 rounded-lg hover:bg-gray-800 min-h-[44px] text-sm sm:text-base"
                >
                  <span>Get Started</span>
                  <ArrowRight className="ml-2 h-3 w-0 group-hover:w-3 transition-all opacity-0 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@hiregenie.io"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group py-2 px-2 -mx-2 rounded-lg hover:bg-gray-800 min-h-[44px] text-sm sm:text-base"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  <span>Contact</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 sm:pt-12 border-t border-gray-800">
          <div className="flex flex-col space-y-4 sm:space-y-6 md:space-y-0 md:flex-row md:justify-between md:items-center">
            {/* Copyright */}
            <div className="text-gray-500 text-sm sm:text-base text-center md:text-left order-2 md:order-1">
              © {currentYear} HireGenie. All rights reserved.
            </div>
            
            {/* Quick Links */}
            <div className="flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6 text-sm sm:text-base text-gray-500 order-1 md:order-2">
              <Link 
                href="/" 
                className="hover:text-gray-300 transition-colors duration-200 py-2 px-2 -mx-2 rounded hover:bg-gray-800 min-h-[44px] flex items-center"
              >
                Home
              </Link>
              <Link 
                href="#pricing" 
                className="hover:text-gray-300 transition-colors duration-200 py-2 px-2 -mx-2 rounded hover:bg-gray-800 min-h-[44px] flex items-center"
              >
                Pricing
              </Link>
              <Link 
                href="/dashboard" 
                className="hover:text-gray-300 transition-colors duration-200 py-2 px-2 -mx-2 rounded hover:bg-gray-800 min-h-[44px] flex items-center"
              >
                Dashboard
              </Link>
              <Link 
                href="/about" 
                className="hover:text-gray-300 transition-colors duration-200 py-2 px-2 -mx-2 rounded hover:bg-gray-800 min-h-[44px] flex items-center"
              >
                About
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
