import { useState, useEffect, useCallback } from 'react';

export interface JobInfo {
  jobTitle: string;
  company: string;
  location: string;
  industry: string;
  department: string;
  experienceLevel: string;
  workType: string;
}

interface UseJobInfoResult {
  jobInfo: JobInfo | null;
  isLoading: boolean;
  error: string | null;
  extractJobInfo: (jobDescription: string) => Promise<void>;
}

// In-memory cache to avoid repeated API calls for same job descriptions
const jobInfoCache = new Map<string, JobInfo>();

// Create a hash of the job description for caching
const createJobDescriptionHash = (jobDescription: string): string => {
  // Simple hash function for caching - you could use a more sophisticated one
  let hash = 0;
  for (let i = 0; i < jobDescription.length; i++) {
    const char = jobDescription.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
};

export const useJobInfo = (): UseJobInfoResult => {
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractJobInfo = useCallback(async (jobDescription: string) => {
    if (!jobDescription || jobDescription.trim().length === 0) {
      setJobInfo({
        jobTitle: "Position Not Specified",
        company: "Company Not Specified",
        location: "Not specified",
        industry: "Not specified",
        department: "Not specified",
        experienceLevel: "Not specified",
        workType: "Not specified"
      });
      return;
    }

    // Check cache first
    const cacheKey = createJobDescriptionHash(jobDescription);
    const cachedResult = jobInfoCache.get(cacheKey);
    
    if (cachedResult) {
      setJobInfo(cachedResult);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/extract-job-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: jobDescription.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract job information');
      }

      const extractedJobInfo = data.jobInfo;
      
      // Cache the result
      jobInfoCache.set(cacheKey, extractedJobInfo);
      
      setJobInfo(extractedJobInfo);
      setError(null);

    } catch (err) {
      console.error('Error extracting job info:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract job information';
      setError(errorMessage);
      
      // Set fallback data on error
      const fallbackJobInfo: JobInfo = {
        jobTitle: "Position Not Specified",
        company: "Company Not Specified",
        location: "Not specified",
        industry: "Not specified",
        department: "Not specified",
        experienceLevel: "Not specified",
        workType: "Not specified"
      };
      
      setJobInfo(fallbackJobInfo);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    jobInfo,
    isLoading,
    error,
    extractJobInfo
  };
};

// Utility function to get performance color based on ATS score
export const getATSScoreColor = (score: number | null): string => {
  if (!score) return 'text-gray-500';
  if (score >= 85) return 'text-green-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

// Utility function to get ATS score label
export const getATSScoreLabel = (score: number | null): string => {
  if (!score) return 'Not scored';
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs Work';
};

// Utility function to get card styling based on ATS score
export const getCardStyling = (atsScore: number | null) => {
  if (!atsScore) return {
    border: "border-l-4 border-l-gray-300",
    bg: "bg-gray-50/30",
    badge: "📝 Not Scored",
    badgeColor: "bg-gray-100 text-gray-700 border-gray-200"
  };
  
  if (atsScore >= 85) return {
    border: "border-l-4 border-l-green-500",
    bg: "bg-green-50/50",
    badge: "🏆 High Performer",
    badgeColor: "bg-green-100 text-green-700 border-green-200"
  };
  
  if (atsScore >= 70) return {
    border: "border-l-4 border-l-blue-500", 
    bg: "bg-blue-50/50",
    badge: "✅ Good Score",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200"
  };
  
  if (atsScore >= 50) return {
    border: "border-l-4 border-l-yellow-500",
    bg: "bg-yellow-50/50", 
    badge: "⚠️ Fair Score",
    badgeColor: "bg-yellow-100 text-yellow-700 border-yellow-200"
  };
  
  return {
    border: "border-l-4 border-l-red-500",
    bg: "bg-red-50/50",
    badge: "❌ Needs Work",
    badgeColor: "bg-red-100 text-red-700 border-red-200"
  };
}; 