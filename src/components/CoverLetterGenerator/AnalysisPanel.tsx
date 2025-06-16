import React, { useState } from 'react';
import { 
  X, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Award,
  Loader,
  Check,
  Lightbulb,
  Zap,
  AlignLeft,
  PanelRightClose,
  PanelRightOpen
} from "lucide-react";
import { SectionAnalysis, AIAnalysisResponse } from './types';
import { getSectionTextAI } from './helpers';

interface AnalysisPanelProps {
  // State
  isOpen: boolean;
  sectionAnalysis: {[key: string]: {score: number, issues: string[]}};
  sectionImprovements: {[key: string]: string};
  isImproving: boolean;
  currentSection: string;
  editableCoverLetter: string;
  expandedSections: {[key: string]: boolean};
  editableSections: {[key: string]: string};
  editableImprovements: {[key: string]: string};
  aiAnalysisResult?: AIAnalysisResponse | null;
  isAnalyzing?: boolean;
  
  // Handlers
  onClose: () => void;
  onSectionImprove: (section: string, style: string) => void;
  onApplyImprovement: (section: string, improvement: string) => void;
  onToggleSection: (section: string) => void;
  onSectionEdit: (section: string, content: string) => void;
  onImprovementEdit: (section: string, content: string) => void;
  onApplySectionEdit: (section: string) => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  isOpen,
  sectionAnalysis,
  sectionImprovements,
  isImproving,
  currentSection,
  editableCoverLetter,
  expandedSections,
  editableSections,
  editableImprovements,
  aiAnalysisResult,
  isAnalyzing,
  onClose,
  onSectionImprove,
  onApplyImprovement,
  onToggleSection,
  onSectionEdit,
  onImprovementEdit,
  onApplySectionEdit
}) => {
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({});

  const getSectionText = (section: string, content: string) => {
    // Use AI-detected boundaries if available, otherwise fallback to code-based
    return getSectionTextAI(section, content, aiAnalysisResult || undefined);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const improvementOptions = [
    { id: 'professional', label: 'Professional', icon: Lightbulb, color: 'blue' },
    { id: 'enthusiastic', label: 'Enthusiastic', icon: Zap, color: 'green' },
    { id: 'concise', label: 'Concise', icon: AlignLeft, color: 'orange' },
    { id: 'impactful', label: 'Impactful', icon: Award, color: 'purple' }
  ];

  const sections = [
    { key: 'opening', label: 'Opening Paragraph', icon: Target },
    { key: 'body', label: 'Body Paragraphs', icon: TrendingUp },
    { key: 'closing', label: 'Closing Paragraph', icon: Award }
  ];

  const toggleSectionCollapse = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {/* This will be handled by parent */}}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 bg-indigo-600 text-white p-3 rounded-l-lg shadow-lg hover:bg-indigo-700 transition-all duration-200 group"
        title="Open Analysis Panel"
      >
        <PanelRightOpen className="h-5 w-5 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-indigo-600 mr-2" />
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center">
                Section Analysis
                {isAnalyzing && (
                  <Loader className="h-4 w-4 animate-spin ml-2 text-indigo-600" />
                )}
              </h3>
              <p className="text-xs text-gray-500">
                {isAnalyzing ? 'AI is analyzing your cover letter...' : 'Improve each section individually'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-lg transition-colors"
            title="Close Panel"
          >
            <PanelRightClose className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {sections.map((section) => {
            const analysis = sectionAnalysis[section.key];
            const improvement = sectionImprovements[section.key];
            const isExpanded = expandedSections[section.key];
            const isCollapsed = collapsedSections[section.key];
            const sectionText = getSectionText(section.key, editableCoverLetter);
            const editableText = editableSections[section.key] || sectionText;
            const editableImprovement = editableImprovements[section.key] || improvement;
            const IconComponent = section.icon;

            if (!analysis && !sectionText) return null;

            return (
              <div key={section.key} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Section Header */}
                <div 
                  className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSectionCollapse(section.key)}
                >
                  <div className="flex items-center">
                    <IconComponent className="h-4 w-4 text-indigo-600 mr-2" />
                    <span className="font-medium text-gray-900">{section.label}</span>
                    {analysis && (
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full border ${getScoreColor(analysis.score)}`}>
                        {analysis.score}/100
                      </span>
                    )}
                  </div>
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                {/* Section Content */}
                {!isCollapsed && (
                  <div className="p-3 space-y-3">
                    {/* Issues */}
                    {analysis && analysis.issues.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-700">Issues to address:</div>
                        {analysis.issues.map((issue, index) => (
                          <div key={index} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                            • {issue}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Original Text */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-gray-700">Current text:</div>
                        <button
                          onClick={() => onToggleSection(section.key)}
                          className="text-xs text-indigo-600 hover:text-indigo-700"
                        >
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </button>
                      </div>
                      <textarea
                        value={editableText}
                        onChange={(e) => onSectionEdit(section.key, e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded p-2 resize-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        style={{ height: isExpanded ? '120px' : '60px' }}
                        placeholder={`Enter ${section.label.toLowerCase()}...`}
                      />
                      {editableText !== sectionText && (
                        <button
                          onClick={() => onApplySectionEdit(section.key)}
                          className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors"
                        >
                          Apply Changes
                        </button>
                      )}
                    </div>

                    {/* Improvement Options */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-700">AI Improvements:</div>
                      <div className="grid grid-cols-2 gap-1">
                        {improvementOptions.map((option) => {
                          const OptionIcon = option.icon;
                          return (
                            <button
                              key={option.id}
                              onClick={() => onSectionImprove(section.key, option.id)}
                              disabled={isImproving && currentSection === section.key}
                              className={`flex items-center p-2 text-xs rounded border transition-all disabled:opacity-50 ${
                                option.color === 'blue' ? 'border-blue-200 hover:bg-blue-50 text-blue-700' :
                                option.color === 'green' ? 'border-green-200 hover:bg-green-50 text-green-700' :
                                option.color === 'orange' ? 'border-orange-200 hover:bg-orange-50 text-orange-700' :
                                'border-purple-200 hover:bg-purple-50 text-purple-700'
                              }`}
                            >
                              {isImproving && currentSection === section.key ? (
                                <Loader className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <OptionIcon className="h-3 w-3 mr-1" />
                              )}
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI Improvement Result */}
                    {improvement && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-700">AI Suggestion:</div>
                        <textarea
                          value={editableImprovement}
                          onChange={(e) => onImprovementEdit(section.key, e.target.value)}
                          className="w-full text-xs border border-indigo-200 rounded p-2 bg-indigo-50 resize-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          style={{ height: '80px' }}
                          placeholder="AI improvement will appear here..."
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onApplyImprovement(section.key, editableImprovement)}
                            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition-colors flex items-center"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Apply
                          </button>
                          <div className="text-xs text-gray-500">
                            {editableImprovement.split(' ').length} words
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 flex items-center">
            <span className="mr-1">💡</span>
            <span>Changes are applied to your cover letter automatically</span>
          </div>
        </div>
      </div>
    </>
  );
}; 