import React from 'react';
import { 
  X, 
  Sparkles, 
  Loader, 
  Check, 
  Lightbulb, 
  Zap, 
  AlignLeft, 
  Award 
} from "lucide-react";

interface AIWritingAssistantProps {
  // State
  selectedText: string;
  isImproving: boolean;
  improvementSuggestions: string[];
  showImprovementOptions: boolean;
  
  // Handlers
  setShowImprovementOptions: (show: boolean) => void;
  improveText: (improvementType: string) => void;
  replaceWithImprovement: (improvement: string) => void;
  setImprovementSuggestions: (suggestions: string[]) => void;
}

export const AIWritingAssistant: React.FC<AIWritingAssistantProps> = ({
  selectedText,
  isImproving,
  improvementSuggestions,
  showImprovementOptions,
  setShowImprovementOptions,
  improveText,
  replaceWithImprovement,
  setImprovementSuggestions
}) => {
  if (!showImprovementOptions) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-indigo-600 mr-3" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-ping"></div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">AI Writing Assistant</h3>
              <p className="text-sm text-gray-500">Improve your selected text with AI suggestions</p>
            </div>
          </div>
          <button
            onClick={() => setShowImprovementOptions(false)}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Before/After Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Original Text */}
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <h4 className="font-medium text-gray-700">Original Text</h4>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[120px]">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedText}
                </p>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span>{selectedText.split(' ').length} words</span>
                <span className="mx-2">•</span>
                <span>{selectedText.length} characters</span>
              </div>
            </div>
            
            {/* Improved Text Preview */}
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2 animate-pulse"></div>
                <h4 className="font-medium text-indigo-700">AI Improved Version</h4>
                {improvementSuggestions.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                    {improvementSuggestions.length} suggestions
                  </span>
                )}
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 min-h-[120px]">
                {isImproving ? (
                  <div className="flex items-center justify-center h-24">
                    <Loader className="h-6 w-6 animate-spin text-indigo-600 mr-3" />
                    <span className="text-indigo-600 font-medium">Generating improvements...</span>
                  </div>
                ) : improvementSuggestions.length > 0 ? (
                  <div className="space-y-3">
                    {improvementSuggestions.map((suggestion, index) => (
                      <div key={index} className="bg-white border border-indigo-200 rounded-lg p-3 hover:border-indigo-300 transition-colors">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
                          {suggestion}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <span>{suggestion.split(' ').length} words</span>
                            <span className="mx-2">•</span>
                            <span>{suggestion.length} characters</span>
                            {suggestion.split(' ').length !== selectedText.split(' ').length && (
                              <>
                                <span className="mx-2">•</span>
                                <span className={suggestion.split(' ').length > selectedText.split(' ').length ? 'text-orange-600' : 'text-green-600'}>
                                  {suggestion.split(' ').length > selectedText.split(' ').length ? '+' : ''}
                                  {suggestion.split(' ').length - selectedText.split(' ').length} words
                                </span>
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => replaceWithImprovement(suggestion)}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center transition-colors"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Apply This
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-24 text-gray-400">
                    <p>Choose an improvement style below to see suggestions</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Improvement Style Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Zap className="h-5 w-5 text-indigo-600 mr-2" />
              Choose Improvement Style
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => improveText('professional')}
                disabled={isImproving}
                className="group p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left"
              >
                <div className="flex items-center mb-2">
                  <Lightbulb className="h-5 w-5 text-blue-600 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-blue-800">Professional</span>
                </div>
                <p className="text-xs text-blue-600">More formal, structured, and business-appropriate language</p>
              </button>

              <button
                onClick={() => improveText('enthusiastic')}
                disabled={isImproving}
                className="group p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left"
              >
                <div className="flex items-center mb-2">
                  <Zap className="h-5 w-5 text-green-600 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-green-800">Enthusiastic</span>
                </div>
                <p className="text-xs text-green-600">More energetic, passionate, and engaging tone</p>
              </button>

              <button
                onClick={() => improveText('concise')}
                disabled={isImproving}
                className="group p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left"
              >
                <div className="flex items-center mb-2">
                  <AlignLeft className="h-5 w-5 text-orange-600 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-orange-800">Concise</span>
                </div>
                <p className="text-xs text-orange-600">Shorter, more direct, and to-the-point</p>
              </button>

              <button
                onClick={() => improveText('impactful')}
                disabled={isImproving}
                className="group p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left"
              >
                <div className="flex items-center mb-2">
                  <Award className="h-5 w-5 text-purple-600 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-purple-800">Impactful</span>
                </div>
                <p className="text-xs text-purple-600">More compelling, persuasive, and memorable</p>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">💡</span>
              <span>Tip: You can always undo changes with Ctrl+Z</span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowImprovementOptions(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              {improvementSuggestions.length > 0 && (
                <button 
                  onClick={() => {
                    setImprovementSuggestions([]);
                    setShowImprovementOptions(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 