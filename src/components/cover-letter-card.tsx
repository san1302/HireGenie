"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface CoverLetter {
  id: string;
  cover_letter_content: string;
  job_description: string;
  resume_filename: string | null;
  tone: string;
  ats_score: number | null;
  created_at: string;
}

interface CoverLetterCardProps {
  letter: CoverLetter;
}

export default function CoverLetterCard({ letter }: CoverLetterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(letter.cover_letter_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'bg-gray-50 text-gray-700 border-gray-200';
    if (score >= 80) return 'bg-green-50 text-green-700 border-green-200';
    if (score >= 60) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  return (
    <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-gray-900 mb-2">
              Cover Letter #{letter.id.slice(-8)}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{new Date(letter.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span className="capitalize">{letter.tone} tone</span>
              {letter.resume_filename && (
                <>
                  <span>•</span>
                  <span>{letter.resume_filename}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {letter.ats_score && (
              <Badge variant="outline" className={`text-xs ${getScoreColor(letter.ats_score)}`}>
                ATS: {letter.ats_score}/100
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Preview</h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {letter.cover_letter_content.substring(0, 150)}...
            </p>
          </div>
          
          {isExpanded && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Full Cover Letter</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {letter.cover_letter_content}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Job Description Used</h4>
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-600 max-h-40 overflow-y-auto">
                  {letter.job_description}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 