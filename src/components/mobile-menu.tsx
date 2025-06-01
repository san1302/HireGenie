"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/button";

interface MobileMenuProps {
  user: any;
}

export default function MobileMenu({ user }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="ghost" 
        size="sm" 
        className="p-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle mobile menu"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </Button>
      
      {/* Mobile menu dropdown */}
      <div className={`absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 transition-all duration-200 ${
        isOpen ? 'opacity-100 visible transform scale-100' : 'opacity-0 invisible transform scale-95'
      }`}>
        {user ? (
          <Link 
            href="/dashboard" 
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link 
              href="/sign-in" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Sign Up
            </Link>
          </>
        )}
        <Link 
          href="#features" 
          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={() => setIsOpen(false)}
        >
          Features
        </Link>
        <Link 
          href="#how-it-works" 
          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={() => setIsOpen(false)}
        >
          How it Works
        </Link>
        <Link 
          href="/pricing" 
          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={() => setIsOpen(false)}
        >
          Pricing
        </Link>
      </div>
    </div>
  );
} 