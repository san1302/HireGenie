"use client";

import { usePathname } from 'next/navigation';

export default function SchemaMarkup() {
  const pathname = usePathname();

  // Organization Schema - appears on all pages
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "HireGenie",
    "url": "https://hiregenie.io",
    "logo": "https://hiregenie.io/favicon.svg",
    "description": "AI-powered cover letter generator that creates ATS-optimized, personalized cover letters in under 2 minutes.",
    "foundingDate": "2024",
    "industry": "Human Resources Technology",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "san@san-verse.com",
      "contactType": "Customer Service"
    },
    "sameAs": [
      "https://twitter.com/hiregenie"
    ]
  };

  // WebApplication Schema for homepage and dashboard
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "HireGenie",
    "url": "https://hiregenie.io",
    "description": "Create ATS-optimized, personalized cover letters in under 2 minutes with AI technology.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free plan with 2 ATS-optimized cover letters monthly"
    },
    "featureList": [
      "ATS Score Analysis",
      "AI-Powered Cover Letter Generation", 
      "Resume Analysis",
      "Job Description Matching",
      "Professional Templates",
      "Export Options"
    ]
  };

  // SoftwareApplication Schema for better app classification
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "HireGenie",
    "description": "AI-powered cover letter generator for job seekers",
    "url": "https://hiregenie.io",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "softwareVersion": "1.0",
    "author": {
      "@type": "Organization",
      "name": "HireGenie"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0",
        "priceCurrency": "USD",
        "description": "2 ATS-optimized cover letters monthly"
      },
      {
        "@type": "Offer", 
        "name": "Pro Plan",
        "price": "29",
        "priceCurrency": "USD",
        "description": "Unlimited cover letters with advanced features"
      }
    ]
  };

  // FAQ Schema for homepage
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does HireGenie's ATS optimization work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "HireGenie analyzes your resume and job description to create cover letters optimized for Applicant Tracking Systems (ATS). Our AI identifies key skills, requirements, and keywords to ensure your application passes initial screening."
        }
      },
      {
        "@type": "Question",
        "name": "How long does it take to generate a cover letter?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "HireGenie generates personalized, ATS-optimized cover letters in under 2 minutes. Simply upload your resume and job description, and our AI creates a professional cover letter instantly."
        }
      },
      {
        "@type": "Question",
        "name": "What's included in the free plan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The free plan includes 2 ATS-optimized cover letters monthly, real-time ATS scoring, essential improvement tips, proven templates, standard export options, and community support."
        }
      }
    ]
  };

  // Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "AI Cover Letter Generation",
    "description": "Professional cover letter writing service powered by artificial intelligence",
    "provider": {
      "@type": "Organization",
      "name": "HireGenie"
    },
    "serviceType": "Cover Letter Writing",
    "audience": {
      "@type": "Audience",
      "audienceType": "Job Seekers"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free ATS-optimized cover letter generation"
    }
  };

  // Determine which schemas to include based on current page
  const getSchemas = () => {
    const schemas: any[] = [organizationSchema];

    if (pathname === '/') {
      schemas.push(webApplicationSchema, softwareApplicationSchema, faqSchema, serviceSchema);
    } else if (pathname === '/dashboard') {
      schemas.push(webApplicationSchema);
    } else if (pathname === '/pricing') {
      schemas.push(softwareApplicationSchema);
    }

    return schemas;
  };

  const schemas = getSchemas();

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}