"use client";

import { useEffect } from 'react';
import Script from 'next/script';

// Google Analytics configuration
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: {
        page_title?: string;
        page_location?: string;
        custom_map?: { [key: string]: string };
        [key: string]: any;
      }
    ) => void;
    dataLayer: any[];
  }
}

// Analytics event tracking functions
export const trackEvent = (eventName: string, parameters?: { [key: string]: any }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Specific event tracking functions for HireGenie
export const trackSignUp = (method: 'email' | 'google') => {
  trackEvent('sign_up', {
    method: method,
    event_category: 'engagement',
    event_label: 'user_registration'
  });
};

export const trackCoverLetterGenerated = (atsScore?: number) => {
  trackEvent('cover_letter_generated', {
    event_category: 'conversion',
    event_label: 'cover_letter_creation',
    ats_score: atsScore,
    value: 1
  });
};

export const trackUpgradeAttempt = (planName: string) => {
  trackEvent('begin_checkout', {
    event_category: 'conversion',
    event_label: 'upgrade_attempt',
    plan_name: planName,
    currency: 'USD'
  });
};

export const trackSuccessfulUpgrade = (planName: string, value: number) => {
  trackEvent('purchase', {
    event_category: 'conversion',
    event_label: 'successful_upgrade',
    plan_name: planName,
    currency: 'USD',
    value: value
  });
};

export const trackDemoUsage = (feature: string) => {
  trackEvent('demo_usage', {
    event_category: 'engagement',
    event_label: 'demo_interaction',
    feature: feature
  });
};

export const trackResumeUpload = () => {
  trackEvent('resume_upload', {
    event_category: 'engagement',
    event_label: 'file_upload'
  });
};

export const trackJobDescriptionUpload = () => {
  trackEvent('job_description_upload', {
    event_category: 'engagement',
    event_label: 'job_description_input'
  });
};

export const trackCoverLetterDownload = (format: string) => {
  trackEvent('cover_letter_download', {
    event_category: 'conversion',
    event_label: 'file_download',
    format: format
  });
};

export const trackPageView = (pageTitle: string, pagePath: string) => {
  trackEvent('page_view', {
    page_title: pageTitle,
    page_location: `${window.location.origin}${pagePath}`
  });
};

// Main Analytics component
export default function Analytics() {
  useEffect(() => {
    // Initialize dataLayer if it doesn't exist
    if (typeof window !== 'undefined' && !window.dataLayer) {
      window.dataLayer = [];
    }
  }, []);

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
            custom_map: {
              'plan_type': 'plan_type',
              'user_type': 'user_type'
            }
          });
        `}
      </Script>
    </>
  );
}