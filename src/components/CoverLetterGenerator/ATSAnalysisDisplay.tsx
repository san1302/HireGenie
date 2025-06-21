import React from 'react';
import { 
  Target, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  FileText, 
  Award 
} from "lucide-react";
import { ATSAnalysis } from './types';
import { getScoreColor, getProgressColor } from './helpers';

interface ATSAnalysisDisplayProps {
  atsAnalysis: ATSAnalysis | null;
  showATSDetails: boolean;
  setShowATSDetails: (show: boolean) => void;
}

// Utility function to format score values
const formatScore = (value: unknown): string => {
  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(numValue)) return '0';
  
  // Round to 1 decimal place if there's a meaningful decimal, otherwise show as integer
  return numValue % 1 === 0 ? Math.round(numValue).toString() : numValue.toFixed(1);
};

export const ATSAnalysisDisplay: React.FC<ATSAnalysisDisplayProps> = ({
  atsAnalysis,
  showATSDetails,
  setShowATSDetails
}) => {
  if (!atsAnalysis) return null;

  if (!atsAnalysis.success) {
    return (
      <div className="mt-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <h4 className="text-sm font-medium text-yellow-800">ATS Analysis Unavailable</h4>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            {atsAnalysis.error || "Unable to analyze ATS compatibility at this time."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Target className="h-5 w-5 text-indigo-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">ATS Compatibility Score</h4>
          </div>
          <div className="flex items-center space-x-3">
            {/* Pass/Fail Status */}
            {atsAnalysis.passFailStatus && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                atsAnalysis.passFailStatus === 'PASS'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : atsAnalysis.passFailStatus === 'FAIL'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                {atsAnalysis.passFailStatus === 'PASS' ? '✓ LIKELY TO PASS' :
                  atsAnalysis.passFailStatus === 'FAIL' ? '✗ LIKELY REJECTED' :
                    '? NEEDS REVIEW'}
              </div>
            )}
            <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getScoreColor(atsAnalysis.overallScore || 0)}`}>
              {atsAnalysis.overallScore}/100
            </div>
          </div>
        </div>

        {/* Critical Issues Alert */}
        {atsAnalysis.criticalIssues && atsAnalysis.criticalIssues.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-800">Critical Issues Detected</span>
            </div>
            <ul className="space-y-1">
              {atsAnalysis.criticalIssues.map((issue, index) => (
                <li key={index} className="text-sm text-red-700 flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Overall Score Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall ATS Score</span>
            <span>{formatScore(atsAnalysis.overallScore)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(atsAnalysis.overallScore || 0)}`}
              style={{ width: `${atsAnalysis.overallScore}%` }}
            ></div>
          </div>
        </div>

        {/* Score Breakdown */}
        {atsAnalysis.breakdown && (
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Parseability (30%)</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(atsAnalysis.breakdown.parseability)}`}
                    style={{ width: `${atsAnalysis.breakdown.parseability}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-8">{formatScore(atsAnalysis.breakdown.parseability)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Keyword Match (35%)</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(atsAnalysis.breakdown.keywordMatch)}`}
                    style={{ width: `${atsAnalysis.breakdown.keywordMatch}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-8">{formatScore(atsAnalysis.breakdown.keywordMatch)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Skills Alignment (20%)</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(atsAnalysis.breakdown.skillsAlignment)}`}
                    style={{ width: `${atsAnalysis.breakdown.skillsAlignment}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-8">{formatScore(atsAnalysis.breakdown.skillsAlignment)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Format & Structure (10%)</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(atsAnalysis.breakdown.formatCompatibility)}`}
                    style={{ width: `${atsAnalysis.breakdown.formatCompatibility}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-8">{formatScore(atsAnalysis.breakdown.formatCompatibility)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Contact Info (3%)</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(atsAnalysis.breakdown.contactInfo)}`}
                    style={{ width: `${atsAnalysis.breakdown.contactInfo}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-8">{formatScore(atsAnalysis.breakdown.contactInfo)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bonus Features (2%)</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(atsAnalysis.breakdown.bonusFeatures)}`}
                    style={{ width: `${atsAnalysis.breakdown.bonusFeatures}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-8">{formatScore(atsAnalysis.breakdown.bonusFeatures)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Details Button */}
        <button
          onClick={() => setShowATSDetails(!showATSDetails)}
          className="w-full flex items-center justify-center py-2 text-sm text-indigo-600 hover:text-indigo-700 border-t border-gray-200 mt-4 pt-4"
        >
          {showATSDetails ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show Detailed Analysis
            </>
          )}
        </button>

        {/* Detailed Analysis */}
        {showATSDetails && (
          <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
            {/* Enhanced Recommendations */}
            {atsAnalysis.recommendations && atsAnalysis.recommendations.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
                  Recommendations
                </h5>
                <div className="space-y-3">
                  {atsAnalysis.recommendations.map((rec, index) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      rec.priority === 'CRITICAL'
                        ? 'bg-red-50 border-red-400'
                        : rec.priority === 'HIGH'
                          ? 'bg-orange-50 border-orange-400'
                          : rec.priority === 'MEDIUM'
                            ? 'bg-yellow-50 border-yellow-400'
                            : 'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="flex items-start justify-between mb-1">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          rec.priority === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : rec.priority === 'HIGH'
                              ? 'bg-orange-100 text-orange-800'
                              : rec.priority === 'MEDIUM'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">{rec.issue}</p>
                      <p className="text-sm text-gray-700 mb-1"><strong>Fix:</strong> {rec.fix}</p>
                      <p className="text-xs text-gray-600"><strong>Impact:</strong> {rec.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Structural Analysis */}
            {(atsAnalysis.sectionsFound || atsAnalysis.missingCriticalSections || atsAnalysis.sectionOrder) && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-1 text-purple-500" />
                  Resume Structure Analysis
                </h5>

                {/* Sections Found */}
                {atsAnalysis.sectionsFound && atsAnalysis.sectionsFound.length > 0 && (
                  <div className="mb-3">
                    <h6 className="text-xs font-medium text-gray-700 mb-2">Detected Sections</h6>
                    <div className="flex flex-wrap gap-1">
                      {atsAnalysis.sectionsFound.map((section, index) => (
                        <span key={index} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200 capitalize">
                          {section}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Critical Sections */}
                {atsAnalysis.missingCriticalSections && atsAnalysis.missingCriticalSections.length > 0 && (
                  <div className="mb-3">
                    <h6 className="text-xs font-medium text-gray-700 mb-2">Missing Critical Sections</h6>
                    <div className="flex flex-wrap gap-1">
                      {atsAnalysis.missingCriticalSections.map((section, index) => (
                        <span key={index} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200 capitalize">
                          {section}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section Order */}
                {atsAnalysis.sectionOrder && atsAnalysis.sectionOrder.length > 0 && (
                  <div className="mb-3">
                    <h6 className="text-xs font-medium text-gray-700 mb-2">Section Order</h6>
                    <div className="flex flex-wrap gap-1">
                      {atsAnalysis.sectionOrder.map((section, index) => (
                        <div key={index} className="flex items-center">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200 capitalize">
                            {index + 1}. {section}
                          </span>
                          {index < atsAnalysis.sectionOrder!.length - 1 && (
                            <span className="mx-1 text-gray-400">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended order: Contact → Summary → Experience → Education → Skills → Certifications
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Missing Keywords */}
            {atsAnalysis.missingKeywords && atsAnalysis.missingKeywords.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Missing Keywords</h5>
                <div className="flex flex-wrap gap-1">
                  {atsAnalysis.missingKeywords.slice(0, 10).map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                      {keyword}
                    </span>
                  ))}
                  {atsAnalysis.missingKeywords.length > 10 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                      +{atsAnalysis.missingKeywords.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Matched Keywords */}
            {atsAnalysis.matchedKeywords && atsAnalysis.matchedKeywords.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Matched Keywords</h5>
                <div className="flex flex-wrap gap-1">
                  {atsAnalysis.matchedKeywords.slice(0, 10).map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                      {keyword}
                    </span>
                  ))}
                  {atsAnalysis.matchedKeywords.length > 10 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                      +{atsAnalysis.matchedKeywords.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Bonus Items */}
            {atsAnalysis.bonusItems && atsAnalysis.bonusItems.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <Award className="h-4 w-4 mr-1 text-yellow-500" />
                  Bonus Features Found
                </h5>
                <ul className="space-y-1">
                  {atsAnalysis.bonusItems.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-yellow-500 mr-2">★</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 