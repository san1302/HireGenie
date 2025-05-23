import React from 'react';
import { Calendar } from 'lucide-react';

export default function ComingSoon() {
  const upcomingFeatures = [
    {
      title: 'Interview Prep Assistant',
      description: 'AI-powered interview question generator with customized answers based on your resume',
      expected: 'Q3 2023',
      icon: '🎯'
    }, 
    {
      title: 'Resume Analyzer & Optimizer',
      description: 'Get detailed feedback on your resume with AI-powered suggestions for improvement',
      expected: 'Q4 2023',
      icon: '📝'
    }, 
    {
      title: 'Job Match Scoring',
      description: 'See how well your skills and experience match job requirements with a percentage score',
      expected: 'Q1 2024',
      icon: '✓'
    }, 
    {
      title: 'Career Path Recommendations',
      description: 'Get personalized career development advice and job role suggestions',
      expected: 'Q2 2024',
      icon: '🚀'
    }
  ];
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Coming Soon
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're constantly improving HireGenie.io with new features
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcomingFeatures.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                {feature.description}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Expected: {feature.expected}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 