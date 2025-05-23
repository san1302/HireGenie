import React from 'react';
import { Upload, FileText, Zap } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <Upload className="h-8 w-8 text-white" />,
      title: 'Upload Resume',
      description: 'Upload your existing resume or CV to our secure platform'
    }, 
    {
      icon: <FileText className="h-8 w-8 text-white" />,
      title: 'Paste Job Description',
      description: "Copy and paste the job description you're applying for"
    }, 
    {
      icon: <Zap className="h-8 w-8 text-white" />,
      title: 'Get Tailored Cover Letter',
      description: 'Receive your personalized cover letter in seconds'
    }
  ];
  
  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Three simple steps to your perfect cover letter
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full max-w-sm flex flex-col items-center text-center relative"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-300">
                    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 