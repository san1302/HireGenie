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
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Logo and about */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="font-bold text-2xl text-white">HireGenie.io</div>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              AI-powered cover letter generator that helps job seekers create personalized, 
              professional cover letters in seconds. Get more interviews and land your dream job.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-gray-400 hover:text-white transition-colors flex items-center group"
                >
                  <span>Features</span>
                  <ArrowRight className="ml-2 h-3 w-0 group-hover:w-3 transition-all opacity-0 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-400 hover:text-white transition-colors flex items-center group"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="ml-2 h-3 w-0 group-hover:w-3 transition-all opacity-0 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-400 hover:text-white transition-colors flex items-center group"
                >
                  <span>Pricing</span>
                  <ArrowRight className="ml-2 h-3 w-0 group-hover:w-3 transition-all opacity-0 group-hover:opacity-100" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors flex items-center group"
                >
                  <span>Home</span>
                  <ArrowRight className="ml-2 h-3 w-0 group-hover:w-3 transition-all opacity-0 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-400 hover:text-white transition-colors flex items-center group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="ml-2 h-3 w-0 group-hover:w-3 transition-all opacity-0 group-hover:opacity-100" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 mb-4 md:mb-0 text-sm">
            © {currentYear} HireGenie.io. All rights reserved.
          </div>
          
          <div className="flex space-x-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-300 transition-colors">
              Home
            </Link>
            <Link href="/pricing" className="hover:text-gray-300 transition-colors">
              Pricing
            </Link>
            <Link href="/dashboard" className="hover:text-gray-300 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
