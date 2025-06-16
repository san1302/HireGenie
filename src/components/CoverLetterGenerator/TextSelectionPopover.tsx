import React from 'react';
import { 
  Loader, 
  Check, 
  Lightbulb, 
  Zap, 
  AlignLeft, 
  Award,
  X,
  Sparkles
} from "lucide-react";

interface TextSelectionInlineProps {
  // State
  selectedText: string;
  isImproving: boolean;
  improvementSuggestions: string[];
  isVisible: boolean;
  
  // Handlers
  onImprove: (improvementType: string) => void;
  onApply: (improvement: string) => void;
  onClose: () => void;
}

export const TextSelectionPopover: React.FC<TextSelectionInlineProps> = ({
  selectedText,
  isImproving,
  improvementSuggestions,
  isVisible,
  onImprove,
  onApply,
  onClose
}) => {
  if (!isVisible || !selectedText.trim()) return null;

  const improvementOptions = [
    {
      id: 'professional',
      label: 'More Professional',
      icon: Lightbulb,
      color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
    },
    {
      id: 'enthusiastic',
      label: 'More Enthusiastic',
      icon: Zap,
      color: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
    },
    {
      id: 'concise',
      label: 'More Concise',
      icon: AlignLeft,
      color: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
    },
    {
      id: 'impactful',
      label: 'More Impactful',
      icon: Award,
      color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
    }
  ];

  return (
    <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Sparkles className="h-4 w-4 text-indigo-600 mr-2" />
          <span className="text-sm font-medium text-indigo-900">Improve Selected Text</span>
        </div>
        <button
          onClick={onClose}
          className="text-indigo-400 hover:text-indigo-600 p-1 rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Selected Text Display */}
      <div className="mb-4">
        <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-3">
          <div className="text-sm text-indigo-800 leading-relaxed">
            "{selectedText}"
          </div>
        </div>
      </div>

      {/* Improvement Suggestions - Show if available */}
      {improvementSuggestions.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-indigo-700 mb-2 font-medium">Choose an improvement:</div>
          <div className="space-y-2">
            {improvementSuggestions.map((suggestion, index) => (
              <div key={index} className="bg-white border border-indigo-200 rounded-lg p-3">
                <div className="text-sm text-gray-700 mb-2 leading-relaxed">
                  "{suggestion}"
                </div>
                <button
                  onClick={() => onApply(suggestion)}
                  className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Use This
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Options */}
      <div>
        {isImproving ? (
          <div className="flex items-center justify-center py-4">
            <Loader className="h-4 w-4 animate-spin text-indigo-600 mr-2" />
            <span className="text-sm text-indigo-600">Generating improvements...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {improvementOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => onImprove(option.id)}
                  className={`flex items-center justify-center p-3 text-xs rounded-lg border transition-all ${option.color}`}
                >
                  <IconComponent className="h-3 w-3 mr-1" />
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}; 