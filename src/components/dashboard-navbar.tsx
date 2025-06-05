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
  CreditCard
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import Logo from './logo'

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

  const checkUserSubscription = useCallback(async (userId: string) => {
    try {
      console.log('Checking subscription for user ID:', userId); // Debug log
      
      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .select("status, plan_name")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      console.log('Subscription query result:', { subscription, error }); // Debug log

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking subscription:', error);
      }

      return {
        hasActiveSubscription: !!subscription,
        planDetails: subscription ? { planName: subscription.plan_name || "Pro" } : undefined
      };
    } catch (error) {
      console.error('Error checking subscription:', error);
      return { hasActiveSubscription: false };
    }
  }, [supabase]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserEmail(user.email || '')
          const subscriptionInfo = await checkUserSubscription(user.id)
          setUserSubscription(subscriptionInfo)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    getUser()
  }, [checkUserSubscription])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
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
    <nav className="w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Logo size="md" showText={true} href="/" />
          
          <div className="hidden md:flex items-center space-x-4">
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
        </div>
        
        <div className="flex items-center space-x-4">
          {!isLoading && (
            <Badge 
              variant="outline" 
              className={`hidden sm:flex ${
                planBadge.variant === 'pro' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              <planBadge.icon className="h-3 w-3 mr-1" />
              {planBadge.text}
            </Badge>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 transition-colors duration-200">
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
              
              {/* Mobile Navigation Items */}
              <div className="md:hidden">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href}>
                      <DropdownMenuItem className="cursor-pointer">
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </DropdownMenuItem>
                    </Link>
                  )
                })}
                <DropdownMenuSeparator />
              </div>

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
        </div>
      </div>
    </nav>
  )
}
