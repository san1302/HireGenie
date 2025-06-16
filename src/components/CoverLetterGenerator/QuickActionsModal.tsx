import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  Loader, 
  Check, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Maximize2,
  Minimize2
} from "lucide-react";
import { SectionAnalysis } from './types';

interface QuickActionsModalProps {
  // State
  showQuickActionsModal: boolean;
  sectionAnalysis: {[key: string]: SectionAnalysis};
  sectionImprovements: {[key: string]: string};
  isImproving: boolean;
  isAnalyzing: boolean;
  currentSection: string;
  expandedSections: {[key: string]: boolean};
  editableSections: {[key: string]: string};
  editableImprovements: {[key: string]: string};
  
  // Handlers
  setShowQuickActionsModal: (show: boolean) => void;
  improveSection: (section: string, style: string) => void;
  applySectionImprovement: (section: string, improvement: string) => void;
  getSectionText: (section: string, content: string) => string;
  setExpandedSections: React.Dispatch<React.SetStateAction<{[key: string]: boolean}>>;
  setEditableSections: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
  setEditableImprovements: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
  
  // Data
  editableCoverLetter: string;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  showQuickActionsModal,
  sectionAnalysis,
  sectionImprovements,
  isImproving,
  isAnalyzing,
  currentSection,
  expandedSections,
  editableSections,
  editableImprovements,
  editableCoverLetter,
  setShowQuickActionsModal,
  improveSection,
  applySectionImprovement,
  getSectionText,
  setExpandedSections,
  setEditableSections,
  setEditableImprovements
}) => {
  const [outputFormat, setOutputFormat] = useState<'section-only' | 'full-letter'>('full-letter');

  if (!showQuickActionsModal) return null;

  const toggleSectionExpansion = (section: string) => {
    setExpandedSections((prev: {[key: string]: boolean}) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getExpandableTextareaHeight = (content: string, isExpanded: boolean) => {
    if (isExpanded) return '40vh';
    
    const lines = content.split('\n').length;
    const minHeight = 120;
    const lineHeight = 24;
    const calculatedHeight = Math.max(minHeight, Math.min(lines * lineHeight, 200));
    
    return `${calculatedHeight}px`;
  };

  const renderFullLetterWithHighlight = (coverLetter: string, section: string, improvement: string) => {
    if (!improvement) return coverLetter;
    
    // For section-only mode, just return the improvement
    if (outputFormat === 'section-only') {
      return <span className="text-gray-700">{improvement}</span>;
    }
    
    // For full-letter mode, reconstruct using AI-detected sections
    // We need to get the AI analysis data to access header/footer
    // For now, we'll extract header/footer by comparing AI sections with full letter
    
    let reconstructedLetter = '';
    let headerContent = '';
    let footerContent = '';
    
    // Get all AI section contents
    const aiSections = {
      opening: sectionAnalysis.opening?.content || '',
      body: sectionAnalysis.body?.content || '',
      closing: sectionAnalysis.closing?.content || ''
    };
    
    // Find header by looking for content before the opening section
    if (aiSections.opening) {
      const openingIndex = coverLetter.indexOf(aiSections.opening);
      if (openingIndex > 0) {
        headerContent = coverLetter.substring(0, openingIndex).trim();
      }
    }
    
    // Find footer by looking for content after the closing section
    if (aiSections.closing) {
      const closingIndex = coverLetter.indexOf(aiSections.closing);
      if (closingIndex !== -1) {
        const afterClosingIndex = closingIndex + aiSections.closing.length;
        if (afterClosingIndex < coverLetter.length) {
          footerContent = coverLetter.substring(afterClosingIndex).trim();
        }
      }
    }
    
    // Reconstruct the letter in order: header + sections + footer
    const parts = [];
    let currentContent = '';
    
    // Add header
    if (headerContent) {
      currentContent += headerContent + '\n\n';
    }
    
    // Add sections in order, replacing the target section with improvement
    const sectionOrder = ['opening', 'body', 'closing'];
    for (const sectionName of sectionOrder) {
      if (sectionName === section) {
        // Replace target section with improvement
        currentContent += improvement;
      } else {
        // Keep original section
        const sectionContent = aiSections[sectionName as keyof typeof aiSections];
        if (sectionContent) {
          currentContent += sectionContent;
        }
      }
      
      // Add spacing between sections
      if (sectionName !== 'closing') {
        currentContent += '\n\n';
      }
    }
    
    // Add footer
    if (footerContent) {
      currentContent += '\n\n' + footerContent;
    }
    
    // Now create highlighted version
    const improvementIndex = currentContent.indexOf(improvement);
    
    if (improvementIndex === -1) {
      // If we can't find the improvement, just return the content as text
      return <span className="text-gray-700">{currentContent}</span>;
    }
    
    // Before the improved section
    if (improvementIndex > 0) {
      parts.push(
        <span key="before" className="text-gray-600">
          {currentContent.substring(0, improvementIndex)}
        </span>
      );
    }
    
    // The improved section (highlighted)
    parts.push(
      <span key="improved" className="bg-green-100 border-l-4 border-green-500 pl-2 font-medium text-green-800">
        {improvement}
      </span>
    );
    
    // After the improved section
    const afterIndex = improvementIndex + improvement.length;
    if (afterIndex < currentContent.length) {
      parts.push(
        <span key="after" className="text-gray-600">
          {currentContent.substring(afterIndex)}
        </span>
      );
    }
    
    return <>{parts}</>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center">
            <div className="relative">
              <Zap className="h-5 w-5 text-indigo-600 mr-2" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">🚀 AI Assistant</h3>
              <p className="text-sm text-gray-600">Analyze and improve your cover letter sections</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Output Format Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Output:</span>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as 'section-only' | 'full-letter')}
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="section-only">Section Only</option>
                <option value="full-letter">Full Letter</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowQuickActionsModal(false)}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {isAnalyzing ? (
            // Loading Screen
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader className="h-12 w-12 text-indigo-600 mx-auto mb-6 animate-spin" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI is Analyzing Your Cover Letter
                </h3>
                <p className="text-gray-600 mb-4">
                  Please wait while we analyze each section for improvements...
                </p>
                <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                  <div className="h-2 bg-indigo-600 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            </div>
          ) : Object.keys(sectionAnalysis).length === 0 ? (
            // No Analysis Yet
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Analysis Available
                </h3>
                <p className="text-gray-500">
                  Generate a cover letter first to see section analysis.
                </p>
              </div>
            </div>
          ) : (
            // Section Analysis Content
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Sections */}
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <h4 className="text-lg font-semibold text-gray-900">Current Sections</h4>
                </div>

                {/* Opening Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-800">Opening Paragraph</h5>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        (sectionAnalysis.opening?.score || 0) >= 80 ? 'bg-green-500' :
                        (sectionAnalysis.opening?.score || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-600">
                        {sectionAnalysis.opening?.score || 0}/100
                      </span>
                    </div>
                  </div>

                  {/* Issues */}
                  {sectionAnalysis.opening?.issues && sectionAnalysis.opening.issues.length > 0 && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
                      <div className="flex items-center mb-1">
                        <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
                        <span className="font-medium text-red-700">Issues Found:</span>
                      </div>
                      <ul className="text-red-600 space-y-1">
                        {sectionAnalysis.opening.issues.map((issue, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-1">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Editable Textarea */}
                  <div className="relative">
                    <textarea
                      value={editableSections.opening || (sectionAnalysis.opening?.content || '')}
                      onChange={(e) => setEditableSections((prev: {[key: string]: string}) => ({ ...prev, opening: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm text-gray-700 leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-300"
                      placeholder="Opening paragraph content will appear here after AI analysis..."
                      style={{
                        height: getExpandableTextareaHeight(
                          editableSections.opening || (sectionAnalysis.opening?.content || ''),
                          expandedSections.opening || false
                        ),
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        overflowY: 'auto'
                      }}
                    />
                    
                    {/* Expand Button */}
                    <button
                      onClick={() => toggleSectionExpansion('opening')}
                      className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-full p-1.5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
                      title={expandedSections.opening ? "Collapse" : "Expand"}
                    >
                      {expandedSections.opening ? (
                        <ChevronUp className="h-3 w-3 text-gray-600 group-hover:text-blue-600 transition-colors" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-gray-600 group-hover:text-blue-600 transition-colors" />
                      )}
                    </button>
                  </div>

                  {/* Improve Button */}
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => improveSection('opening', 'professional')}
                      disabled={isImproving && currentSection === 'opening'}
                      className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                    >
                      {isImproving && currentSection === 'opening' ? (
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Improve Opening
                    </button>
                  </div>
                </div>

                {/* Body Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-800">Body Paragraphs</h5>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        (sectionAnalysis.body?.score || 0) >= 80 ? 'bg-green-500' :
                        (sectionAnalysis.body?.score || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-600">
                        {sectionAnalysis.body?.score || 0}/100
                      </span>
                    </div>
                  </div>

                  {/* Issues */}
                  {sectionAnalysis.body?.issues && sectionAnalysis.body.issues.length > 0 && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
                      <div className="flex items-center mb-1">
                        <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
                        <span className="font-medium text-red-700">Issues Found:</span>
                      </div>
                      <ul className="text-red-600 space-y-1">
                        {sectionAnalysis.body.issues.map((issue, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-1">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Editable Textarea */}
                  <div className="relative">
                    <textarea
                      value={editableSections.body || (sectionAnalysis.body?.content || '')}
                      onChange={(e) => setEditableSections((prev: {[key: string]: string}) => ({ ...prev, body: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm text-gray-700 leading-relaxed focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all duration-300"
                      placeholder="Body paragraphs content will appear here after AI analysis..."
                      style={{
                        height: getExpandableTextareaHeight(
                          editableSections.body || (sectionAnalysis.body?.content || ''),
                          expandedSections.body || false
                        ),
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        overflowY: 'auto'
                      }}
                    />
                    
                    {/* Expand Button */}
                    <button
                      onClick={() => toggleSectionExpansion('body')}
                      className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-full p-1.5 shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-200 group"
                      title={expandedSections.body ? "Collapse" : "Expand"}
                    >
                      {expandedSections.body ? (
                        <ChevronUp className="h-3 w-3 text-gray-600 group-hover:text-green-600 transition-colors" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-gray-600 group-hover:text-green-600 transition-colors" />
                      )}
                    </button>
                  </div>

                  {/* Improve Button */}
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => improveSection('body', 'professional')}
                      disabled={isImproving && currentSection === 'body'}
                      className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                    >
                      {isImproving && currentSection === 'body' ? (
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Improve Body
                    </button>
                  </div>
                </div>

                {/* Closing Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-800">Closing Paragraph</h5>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        (sectionAnalysis.closing?.score || 0) >= 80 ? 'bg-green-500' :
                        (sectionAnalysis.closing?.score || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-600">
                        {sectionAnalysis.closing?.score || 0}/100
                      </span>
                    </div>
                  </div>

                  {/* Issues */}
                  {sectionAnalysis.closing?.issues && sectionAnalysis.closing.issues.length > 0 && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
                      <div className="flex items-center mb-1">
                        <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
                        <span className="font-medium text-red-700">Issues Found:</span>
                      </div>
                      <ul className="text-red-600 space-y-1">
                        {sectionAnalysis.closing.issues.map((issue, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-1">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Editable Textarea */}
                  <div className="relative">
                    <textarea
                      value={editableSections.closing || (sectionAnalysis.closing?.content || '')}
                      onChange={(e) => setEditableSections((prev: {[key: string]: string}) => ({ ...prev, closing: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm text-gray-700 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-300"
                      placeholder="Closing paragraph content will appear here after AI analysis..."
                      style={{
                        height: getExpandableTextareaHeight(
                          editableSections.closing || (sectionAnalysis.closing?.content || ''),
                          expandedSections.closing || false
                        ),
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        overflowY: 'auto'
                      }}
                    />
                    
                    {/* Expand Button */}
                    <button
                      onClick={() => toggleSectionExpansion('closing')}
                      className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-full p-1.5 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 group"
                      title={expandedSections.closing ? "Collapse" : "Expand"}
                    >
                      {expandedSections.closing ? (
                        <ChevronUp className="h-3 w-3 text-gray-600 group-hover:text-purple-600 transition-colors" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-gray-600 group-hover:text-purple-600 transition-colors" />
                      )}
                    </button>
                  </div>

                  {/* Improve Button */}
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => improveSection('closing', 'professional')}
                      disabled={isImproving && currentSection === 'closing'}
                      className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                    >
                      {isImproving && currentSection === 'closing' ? (
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Improve Closing
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Improvements */}
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2 animate-pulse"></div>
                  <h4 className="text-lg font-semibold text-gray-900">AI Improvements</h4>
                </div>

                {Object.keys(sectionImprovements).length === 0 ? (
                  <div className="border border-gray-200 rounded-lg p-8 text-center">
                    <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h5 className="text-lg font-medium text-gray-600 mb-2">No Improvements Yet</h5>
                    <p className="text-sm text-gray-500">
                      Click "Improve" on any section to see AI-generated suggestions
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(sectionImprovements).map(([section, improvement]) => (
                      <div key={section} className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-indigo-800 capitalize">
                            Improved {section}
                          </h5>
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                            ✨ AI Generated
                          </span>
                        </div>
                        
                        {/* Improvement Output */}
                        <div className="relative">
                          {outputFormat === 'section-only' ? (
                            // Section-Only Format - Always Editable
                            <textarea
                              value={editableImprovements[section] || sectionImprovements[section] || ''}
                              onChange={(e) => setEditableImprovements((prev: {[key: string]: string}) => ({ ...prev, [section]: e.target.value }))}
                              className="w-full p-3 border border-gray-200 rounded-lg text-sm text-gray-700 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-300"
                              placeholder={`Improved ${section} will appear here...`}
                              style={{
                                height: getExpandableTextareaHeight(
                                  editableImprovements[section] || sectionImprovements[section] || '',
                                  expandedSections[`improvement_${section}`] || false
                                ),
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word',
                                overflowY: 'auto'
                              }}
                            />
                          ) : (
                            // Full Letter Format - Also Editable
                            <textarea
                              value={editableImprovements[section] || sectionImprovements[section] || ''}
                              onChange={(e) => setEditableImprovements((prev: {[key: string]: string}) => ({ ...prev, [section]: e.target.value }))}
                              className="w-full p-3 border border-gray-200 rounded-lg text-sm text-gray-700 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-300 bg-gray-50"
                              placeholder={`Improved ${section} will appear here...`}
                              style={{
                                height: getExpandableTextareaHeight(
                                  editableImprovements[section] || sectionImprovements[section] || '',
                                  expandedSections[`improvement_${section}`] || false
                                ),
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word',
                                overflowY: 'auto'
                              }}
                            />
                          )}
                          
                          {/* Expand Button */}
                          <button
                            onClick={() => toggleSectionExpansion(`improvement_${section}`)}
                            className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-full p-1.5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 group"
                            title={expandedSections[`improvement_${section}`] ? "Collapse" : "Expand"}
                          >
                            {expandedSections[`improvement_${section}`] ? (
                              <ChevronUp className="h-3 w-3 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                            )}
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => applySectionImprovement(section, editableImprovements[section] || improvement)}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center transition-colors"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Apply This
                          </button>
                          <button
                            onClick={() => improveSection(section, 'enthusiastic')}
                            disabled={isImproving}
                            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Try Different Style
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">💡</span>
              <span>Review and edit improvements before applying. Changes can be undone with Ctrl+Z.</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowQuickActionsModal(false);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 