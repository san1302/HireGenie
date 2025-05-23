import React from 'react';
import { Clock, CheckCircle, Zap, RefreshCw, Shield, Award } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: <Clock className="h-6 w-6 text-indigo-600" />,
      title: 'Save Time',
      description: 'Generate personalized cover letters in seconds, not hours.'
    }, 
    {
      icon: <CheckCircle className="h-6 w-6 text-indigo-600" />,
      title: 'ATS-Friendly',
      description: 'Our AI ensures your cover letter passes through Applicant Tracking Systems.'
    }, 
    {
      icon: <Zap className="h-6 w-6 text-indigo-600" />,
      title: 'Customized Content',
      description: 'Tailored to highlight your relevant skills for each specific job.'
    }, 
    {
      icon: <RefreshCw className="h-6 w-6 text-indigo-600" />,
      title: 'Tone Control',
      description: 'Adjust your writing style from formal to conversational as needed.'
    }, 
    {
      icon: <Shield className="h-6 w-6 text-indigo-600" />,
      title: 'Privacy First',
      description: 'Your resume data is encrypted and never shared with third parties.'
    }, 
    {
      icon: <Award className="h-6 w-6 text-indigo-600" />,
      title: 'Professional Quality',
      description: 'Polished, error-free writing that makes you stand out.'
    }
  ];
  
  return (
    <section id="features" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Features That Make a Difference
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI-powered tools help you create the perfect cover letter in
            minutes, not hours.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-indigo-50 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 