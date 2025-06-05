"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  className?: string;
}

const sizeClasses = {
  sm: {
    image: "w-8 h-8",
    text: "text-lg"
  },
  md: {
    image: "w-10 h-10", 
    text: "text-xl"
  },
  lg: {
    image: "w-14 h-14",
    text: "text-2xl"
  }
};

export default function Logo({ 
  size = "md", 
  showText = true, 
  href = "/",
  className = ""
}: LogoProps) {
  const logoContent = (
    <div className={`flex items-center space-x-2 group ${className}`}>
      {/* Genie Lamp Logo */}
      <div className="relative flex-shrink-0 flex items-center">
        <Image
          src="/images/logo.svg"
          alt="HireGenie Logo"
          width={size === "sm" ? 32 : size === "md" ? 48 : 64}
          height={size === "sm" ? 32 : size === "md" ? 56 : 64}
          className={`group-hover:scale-105 transition-transform duration-200`}
          priority
        />
      </div>
      
      {/* Text */}
      {showText && (
        <div className="flex items-center">
          <span className={`${sizeClasses[size].text} font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-200 leading-none`}>
            HireGenie
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} prefetch className="inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
} 