'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  badges?: React.ReactNode;
}

interface PageLayoutProps {
  children: React.ReactNode;
  header?: PageHeaderProps;
  className?: string;
  spacing?: 'default' | 'compact' | 'loose';
}

/**
 * PageHeader - Consistent mobile-responsive page header
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
  badges
}) => {
  return (
    <div className="mobile-stack gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="responsive-heading">
              {title}
            </h1>
            {subtitle && (
              <p className="responsive-text text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {(actions || badges) && (
        <div className="mobile-stack gap-3">
          {badges}
          {actions}
        </div>
      )}
    </div>
  );
};

/**
 * PageLayout - Main layout wrapper with consistent mobile-responsive patterns
 * 
 * Usage:
 * <PageLayout 
 *   header={{
 *     title: "Dashboard",
 *     subtitle: "Welcome back",
 *     icon: <Home className="h-6 w-6 text-white" />,
 *     badges: <Badge>Pro Plan</Badge>
 *   }}
 * >
 *   <YourContent />
 * </PageLayout>
 */
const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  header,
  className = "",
  spacing = 'default'
}) => {
  const spacingClasses = {
    compact: 'space-y-4',
    default: 'mobile-spacing',
    loose: 'space-y-8'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className={`container-responsive mobile-padding ${spacingClasses[spacing]} ${className}`}>
        {header && <PageHeader {...header} />}
        {children}
      </div>
    </div>
  );
};

export default PageLayout; 