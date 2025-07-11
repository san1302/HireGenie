"use client";

import React, { useState } from 'react';
import { Crown, Lock, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';

interface FreemiumFeatureProps {
  children: React.ReactNode;
  isPremium: boolean;
  isUserPremium: boolean;
  featureName: string;
  description?: string;
  upgradeReason?: string;
  className?: string;
  blurContent?: boolean;
  showPreview?: boolean;
  previewContent?: React.ReactNode;
  onUpgrade?: () => void;
}

export const FreemiumFeature: React.FC<FreemiumFeatureProps> = ({
  children,
  isPremium,
  isUserPremium,
  featureName,
  description,
  upgradeReason = "Upgrade to Pro to unlock this feature",
  className,
  blurContent = true,
  showPreview = false,
  previewContent,
  onUpgrade
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // If feature is not premium or user is premium, show content normally
  if (!isPremium || isUserPremium) {
    return <div className={className}>{children}</div>;
  }

  // Premium feature for non-premium user - Dashboard-inspired clean design
  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      setShowUpgradeModal(true);
    }
  };

  return (
    <>
      <Card className={cn("border-0 shadow-sm bg-gray-50/50 border-gray-200", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">{featureName}</CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Crown className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        </CardHeader>
        <CardContent className="opacity-60 pointer-events-none">
          {showPreview && previewContent ? previewContent : children}
        </CardContent>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex-1">
              {description && (
                <p className="text-xs text-gray-600 mb-2">{description}</p>
              )}
            </div>
            <Button
              onClick={handleUpgradeClick}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
            >
              <Crown className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clean Upgrade Modal - Dashboard Style */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                Unlock {featureName}
              </CardTitle>
              <CardDescription>
                {upgradeReason}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Premium Features List - Dashboard Style */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Detailed ATS Analysis</div>
                    <div className="text-gray-600 text-xs">Complete breakdown with actionable insights</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">AI Writing Assistant</div>
                    <div className="text-gray-600 text-xs">Real-time editing and suggestions</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Download & Export</div>
                    <div className="text-gray-600 text-xs">PDF, DOCX, and custom formats</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Dashboard Style */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => window.location.href = '/pricing'}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

// Specialized components for common use cases - Dashboard-inspired
export const PremiumATSBreakdown: React.FC<{
  children: React.ReactNode;
  isUserPremium: boolean;
  onUpgrade?: () => void;
}> = ({ children, isUserPremium, onUpgrade }) => (
  <FreemiumFeature
    isPremium={true}
    isUserPremium={isUserPremium}
    featureName="Detailed ATS Analysis"
    description="Complete breakdown with actionable recommendations"
    upgradeReason="Unlock detailed ATS analysis to optimize your cover letter for applicant tracking systems"
    onUpgrade={onUpgrade}
  >
    {children}
  </FreemiumFeature>
);

export const PremiumDownload: React.FC<{
  children: React.ReactNode;
  isUserPremium: boolean;
  onUpgrade?: () => void;
}> = ({ children, isUserPremium, onUpgrade }) => {
  // For download, we want a cleaner inline approach
  if (!isUserPremium) {
    return (
      <div className="relative">
        <div className="opacity-60">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Crown className="w-3 h-3 mr-1" />
            Pro Feature
          </Badge>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

export const PremiumAIAssistant: React.FC<{
  children: React.ReactNode;
  isUserPremium: boolean;
  onUpgrade?: () => void;
}> = ({ children, isUserPremium, onUpgrade }) => (
  <FreemiumFeature
    isPremium={true}
    isUserPremium={isUserPremium}
    featureName="AI Writing Assistant"
    description="Real-time suggestions and improvements"
    upgradeReason="Unlock the AI Writing Assistant for real-time editing and optimization"
    onUpgrade={onUpgrade}
  >
    {children}
  </FreemiumFeature>
);