import React from 'react';
import { Upload, FileText, Target, Clock, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <Upload className="h-8 w-8 text-white" />,
      title: 'Upload Resume',
      time: '10 seconds',
      description: 'Upload your existing resume or paste text directly. Our AI instantly parses and analyzes your experience.',
      features: ['Supports PDF, DOC, DOCX', 'Instant parsing', 'Secure & private']
    }, 
    {
      icon: <FileText className="h-8 w-8 text-white" />,
      title: 'Paste Job Description',
      time: '5 seconds',
      description: 'Copy the job posting URL or paste the description. Our AI extracts key requirements and keywords.',
      features: ['Smart keyword detection', 'Requirements analysis', 'Industry recognition']
    }, 
    {
      icon: <Target className="h-8 w-8 text-white" />,
      title: 'Get Cover Letter + ATS Score',
      time: '23 seconds',
      description: 'Receive your tailored cover letter with real-time ATS compatibility analysis and improvement suggestions.',
      features: ['87% avg ATS score', 'Detailed analysis', 'Instant results']
    }
  ];
  
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            38 Seconds to Application-Ready
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From upload to personalized cover letter with ATS analysis – faster than brewing coffee. 
            See exactly why you'll beat the competition.
          </p>
          
          {/* Total Time Indicator */}
          <div className="mt-8 inline-flex items-center bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-full px-6 py-3">
            <Clock className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-700 font-semibold">Total time: 38 seconds</span>
            <span className="text-gray-500 text-sm ml-2">• 10s + 5s + 23s</span>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-8 mb-12">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 w-full max-w-sm flex flex-col items-center text-center relative hover:shadow-xl transition-shadow duration-300"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                {step.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {step.title}
              </h3>
              
              <div className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                {step.time}
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">{step.description}</p>
              
              {/* Features List */}
              <div className="space-y-2 w-full">
                {step.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              {/* Arrow connector for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                  <div className="bg-white rounded-full p-2 shadow-md border border-gray-200">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-indigo-500">
                      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Beat the ATS?
            </h3>
            <p className="text-gray-600 mb-6">
              Join 12,847+ job seekers who've improved their interview rate by 3x with our ATS-optimized cover letters.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                Instant ATS score
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                87% average score
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 