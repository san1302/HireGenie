'use client';

import React from 'react';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveWrapperProps {
  children?: React.ReactNode;
  mobileComponent?: React.ComponentType<any>;
  desktopComponent?: React.ComponentType<any>;
  mobileProps?: any;
  desktopProps?: any;
  className?: string;
  fallbackToChildren?: boolean;
}

/**
 * ResponsiveWrapper - Conditionally renders mobile or desktop components
 * 
 * Usage patterns:
 * 1. Different components: <ResponsiveWrapper mobileComponent={Mobile} desktopComponent={Desktop} />
 * 2. Same component with different props: <ResponsiveWrapper mobileProps={{...}} desktopProps={{...}}>{Component}</ResponsiveWrapper>
 * 3. CSS-only responsive: <ResponsiveWrapper className="responsive-styles">{children}</ResponsiveWrapper>
 */
export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  mobileComponent: MobileComponent,
  desktopComponent: DesktopComponent,
  mobileProps = {},
  desktopProps = {},
  className = "",
  fallbackToChildren = true
}) => {
  const { isMobile } = useResponsive();

  // Pattern 1: Completely different components for mobile/desktop
  if (MobileComponent && DesktopComponent) {
    const Component = isMobile ? MobileComponent : DesktopComponent;
    const props = isMobile ? mobileProps : desktopProps;
    return <Component {...props} />;
  }

  // Pattern 2: Same component with different props
  if (children && (mobileProps || desktopProps)) {
    const props = isMobile ? mobileProps : desktopProps;
    return React.cloneElement(children as React.ReactElement, props);
  }

  // Pattern 3: CSS-only responsive with optional mobile/desktop specific components
  if (MobileComponent && isMobile) {
    return <MobileComponent {...mobileProps} />;
  }

  if (DesktopComponent && !isMobile) {
    return <DesktopComponent {...desktopProps} />;
  }

  // Pattern 4: Fallback to children (CSS responsive)
  if (fallbackToChildren && children) {
    return (
      <div className={`responsive-wrapper ${className} ${isMobile ? 'mobile' : 'desktop'}`}>
        {children}
      </div>
    );
  }

  return null;
};

// Utility components for simple show/hide
export const MobileOnly: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => {
  const { isMobile } = useResponsive();
  
  if (!isMobile) return null;
  
  return <div className={`mobile-only ${className}`}>{children}</div>;
};

export const DesktopOnly: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => {
  const { isMobile } = useResponsive();
  
  if (isMobile) return null;
  
  return <div className={`desktop-only ${className}`}>{children}</div>;
}; 