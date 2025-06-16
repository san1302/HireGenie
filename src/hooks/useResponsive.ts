'use client';

import { useState, useEffect } from 'react';

export interface ResponsiveState {
  isMobile: boolean;
  isDesktop: boolean;
  width: number;
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isDesktop: true,
    width: typeof window !== 'undefined' ? window.innerWidth : 1024
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      setState({
        isMobile: width < 768,
        isDesktop: width >= 768,
        width
      });
    };

    // Initial check
    updateScreenSize();

    // Add event listener
    window.addEventListener('resize', updateScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return state;
};

// Utility constants
export const BREAKPOINTS = {
  MOBILE_MAX: 767,
  DESKTOP_MIN: 768
} as const;

// Helper function for conditional rendering
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}; 