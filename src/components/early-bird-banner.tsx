'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, Crown, Gift, Copy, Check } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'

interface EarlyBirdBannerProps {
  userStatus?: 'guest' | 'free' | 'pro'
}

export default function EarlyBirdBanner({ userStatus = 'guest' }: EarlyBirdBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Check if banner was dismissed
    const dismissed = localStorage.getItem('early-bird-banner-dismissed')
    const dismissedTime = dismissed ? parseInt(dismissed) : 0
    const oneDayInMs = 24 * 60 * 60 * 1000
    
    // Show banner if not dismissed or if dismissed more than 24 hours ago
    const shouldShow = !dismissed || (Date.now() - dismissedTime > oneDayInMs)
    
    // Don't show to pro users
    if (userStatus === 'pro' || !shouldShow) {
      return
    }

    // Show banner with animation delay
    setTimeout(() => {
      setIsVisible(true)
      setIsAnimating(true)
    }, 500)
  }, [userStatus])

  const handleDismiss = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      localStorage.setItem('early-bird-banner-dismissed', Date.now().toString())
    }, 300)
  }

  const handleCopyCode = async () => {
    const code = getBannerContent().code
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getBannerContent = () => {
    switch (userStatus) {
      case 'free':
        return {
          icon: Crown,
          text: "Upgrade to Pro with code",
          code: "HireGenieEarlyBird",
          discount: "20% OFF",
          cta: "Upgrade Now",
          href: "/pricing"
        }
      case 'guest':
      default:
        return {
          icon: Gift,
          text: "Early Bird Special! Use code",
          code: "HireGenieEarlyBird",
          discount: "20% OFF",
          cta: "Get Started",
          href: "/sign-up"
        }
    }
  }

  if (!isVisible) return null

  const content = getBannerContent()
  const IconComponent = content.icon

  return (
    <div className={`relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-lg transition-all duration-300 ${
      isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-gradient-x"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Icon and text */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="relative">
                <IconComponent className="h-5 w-5 text-yellow-300 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
              </div>
            </div>
            
            {/* Desktop text */}
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
              <span>{content.text}</span>
              <div className="flex items-center gap-1 bg-white/20 rounded px-2 py-1">
                <code className="text-yellow-300 font-bold tracking-wide">
                  {content.code}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="ml-1 p-1 rounded hover:bg-white/20 transition-colors duration-200 group"
                  title={copied ? "Copied!" : "Copy code"}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-300" />
                  ) : (
                    <Copy className="h-3 w-3 text-yellow-300 group-hover:text-white" />
                  )}
                </button>
              </div>
              <span>for</span>
              <span className="text-yellow-300 font-bold">{content.discount}</span>
              <span>• Limited Time Only!</span>
            </div>
            
            {/* Mobile text */}
            <div className="sm:hidden flex flex-col gap-1">
              <div className="text-sm font-medium">
                <span className="text-yellow-300 font-bold">{content.discount}</span> Early Bird Special!
              </div>
              <div className="text-xs opacity-90 flex items-center gap-1">
                <span>Code:</span>
                <code className="text-yellow-300 font-bold">{content.code}</code>
                <button
                  onClick={handleCopyCode}
                  className="ml-1 p-0.5 rounded hover:bg-white/20 transition-colors duration-200"
                  title={copied ? "Copied!" : "Copy code"}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-300" />
                  ) : (
                    <Copy className="h-3 w-3 text-yellow-300" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right side - CTA and dismiss */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href={content.href}>
              <Button 
                size="sm" 
                className="bg-white text-purple-600 hover:bg-yellow-50 hover:text-purple-700 font-semibold shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {content.cta}
              </Button>
            </Link>
            
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full hover:bg-white/20 transition-colors duration-200 flex-shrink-0"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Copy feedback tooltip */}
      {copied && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 text-white text-xs rounded shadow-lg z-20">
          Code copied to clipboard!
        </div>
      )}

      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </div>
  )
}

// Add custom CSS for gradient animation
const style = `
  @keyframes gradient-x {
    0%, 100% {
      background-size: 200% 200%;
      background-position: left center;
    }
    50% {
      background-size: 200% 200%;
      background-position: right center;
    }
  }
  .animate-gradient-x {
    animation: gradient-x 8s ease infinite;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style")
  styleSheet.innerText = style
  document.head.appendChild(styleSheet)
} 