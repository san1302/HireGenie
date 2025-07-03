import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import DashboardNavbar from "@/components/dashboard-navbar";
import { SubscriptionCheck } from "@/components/subscription-check";
import EarlyBirdBanner from "@/components/early-bird-banner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  User,
  Bell,
  Shield,
  CreditCard,
  Download,
  Trash2,
  Mail,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertTriangle
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - HireGenie | Account Settings",
  description: "Manage your account preferences, subscription settings, and privacy options.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/dashboard/settings",
  },
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get subscription info
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const userStatus = subscription ? 'pro' : 'free';

  return (
    <SubscriptionCheck>
      <EarlyBirdBanner userStatus={userStatus} />
      <DashboardNavbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container-responsive mobile-padding space-y-8">
          
          {/* Header Section */}
          <div className="mobile-stack gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <SettingsIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="responsive-heading">
                    Settings
                  </h1>
                  <p className="responsive-text text-gray-600">
                    Manage your account and preferences
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Settings */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Profile Settings */}
              <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                          {user.email}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Verified
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Member Since
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                        {new Date(user.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" disabled>
                      <Mail className="h-4 w-4 mr-2" />
                      Change Email
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-3">
                    <strong>Coming Soon:</strong> Email and password changes will be available in the next update.
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5 text-purple-600" />
                    Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Default Tone</label>
                        <p className="text-xs text-gray-500">Your preferred cover letter tone</p>
                      </div>
                      <select className="px-3 py-1 border border-gray-200 rounded text-sm" disabled>
                        <option>Professional</option>
                        <option>Conversational</option>
                        <option>Enthusiastic</option>
                        <option>Formal</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Auto-save Generations</label>
                        <p className="text-xs text-gray-500">Automatically save cover letters to history</p>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" checked disabled className="h-4 w-4 text-blue-600" />
                        <span className="ml-2 text-sm text-gray-600">Enabled</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 bg-purple-50 border border-purple-200 rounded p-3">
                    <strong>Coming Soon:</strong> Customizable preferences and defaults.
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-yellow-600" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Manage your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { label: "Email Updates", desc: "Product updates and new features" },
                      { label: "Usage Alerts", desc: "When you approach plan limits" },
                      { label: "Tips & Tutorials", desc: "Helpful tips to improve your cover letters" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-900">{item.label}</label>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" checked disabled className="h-4 w-4 text-blue-600" />
                          <span className="ml-2 text-sm text-gray-600">On</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-3">
                    <strong>Coming Soon:</strong> Granular notification controls.
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Account Status */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Plan</span>
                      <Badge variant="outline" className={`text-xs ${
                        subscription ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {subscription ? 'Pro' : 'Free'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </div>
                    {subscription && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Next Billing</span>
                        <span className="text-xs text-gray-500">
                          {new Date(subscription.current_period_end).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" size="sm" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm" disabled>
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" size="sm" disabled>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>

              {/* Help */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-3">
                    Contact our support team for assistance with your account or features.
                  </p>
                  <Button size="sm" variant="outline" disabled>
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SubscriptionCheck>
  );
} 