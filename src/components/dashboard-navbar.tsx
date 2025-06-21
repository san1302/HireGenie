'use client'

import Link from 'next/link'
import { createClient } from '../../supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  UserCircle, 
  Home, 
  FileText, 
  Settings, 
  LogOut, 
  Crown,
  Sparkles,
  Plus,
  BarChart3,
  CreditCard,
  Menu,
  X
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import Logo from './logo'
import { useResponsive } from "@/hooks/useResponsive";
import { MobileOnly, DesktopOnly } from "@/components/responsive";

interface UserSubscription {
  hasActiveSubscription: boolean;
  planDetails?: {
    planName: string;
  };
}

export default function DashboardNavbar() {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string>('')
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isMobile } = useResponsive()

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }, [isMobile, isMobileMenuOpen])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const fetchUserData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserEmail(user.email || '')
        
        // Fetch subscription status - using same logic as dashboard page
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle()

        if (subscriptionData) {
          setUserSubscription({
            hasActiveSubscription: true,
            planDetails: {
              planName: 'Pro'
            }
          })
        } else {
          setUserSubscription({
            hasActiveSubscription: false,
            planDetails: {
              planName: 'Free'
            }
          })
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    closeMobileMenu()
  }

  const navigationItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      isActive: pathname === '/dashboard'
    },
    {
      href: '/dashboard#generate',
      label: 'Generate',
      icon: Plus,
      isActive: false,
      isAction: true
    },
    {
      href: '/dashboard/history',
      label: 'History',
      icon: FileText,
      isActive: pathname === '/dashboard/history'
    },
    {
      href: '/dashboard/analytics',
      label: 'Analytics',
      icon: BarChart3,
      isActive: pathname === '/dashboard/analytics'
    }
  ]

  const planBadge = userSubscription?.hasActiveSubscription 
    ? { text: 'Pro Plan', variant: 'pro', icon: Crown }
    : { text: 'Free Plan', variant: 'free', icon: Sparkles }

  return (
    <nav className="w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Logo size="md" showText={true} href="/" />
            
            {/* Desktop Navigation */}
            <DesktopOnly>
              <div className="flex items-center space-x-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button 
                        variant={item.isActive ? "default" : "ghost"} 
                        size="sm" 
                        className={`text-gray-600 hover:text-gray-900 transition-all duration-200 ${
                          item.isActive 
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800' 
                            : ''
                        } ${
                          item.isAction 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                            : ''
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </DesktopOnly>
          </div>
          
          <div className="flex items-center space-x-4">
            {!isLoading && (
              <DesktopOnly>
                <Badge 
                  variant="outline" 
                  className={`${
                    planBadge.variant === 'pro' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  <planBadge.icon className="h-3 w-3 mr-1" />
                  {planBadge.text}
                </Badge>
              </DesktopOnly>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-gray-100 transition-colors duration-200 touch-target"
                >
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userEmail}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userSubscription?.hasActiveSubscription ? 'Pro Plan Member' : 'Free Plan Member'}
                  </p>
                </div>
                <DropdownMenuSeparator />

                <Link href="/dashboard/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <UserCircle className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                </Link>
                
                {/* Subscription Management */}
                {userSubscription?.hasActiveSubscription ? (
                  <Link href="/dashboard/settings#subscription">
                    <DropdownMenuItem className="cursor-pointer">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Subscription
                    </DropdownMenuItem>
                  </Link>
                ) : (
                  <Link href="/pricing">
                    <DropdownMenuItem className="cursor-pointer text-blue-600 focus:text-blue-600">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                    </DropdownMenuItem>
                  </Link>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
            <div className="mobile-padding">
              {/* Plan Badge for Mobile */}
              {!isLoading && (
                <div className="py-3 border-b border-gray-100">
                  <Badge 
                    variant="outline" 
                    className={`${
                      planBadge.variant === 'pro' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    <planBadge.icon className="h-3 w-3 mr-1" />
                    {planBadge.text}
                  </Badge>
                </div>
              )}

              {/* Navigation Links */}
              <div className="py-4 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 touch-target ${
                        item.isActive 
                          ? 'bg-blue-50 text-blue-700' 
                          : item.isAction
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      onClick={closeMobileMenu}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </MobileOnly>
    </nav>
  )
}
