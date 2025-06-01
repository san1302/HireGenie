import React from 'react';
import { Target, Clock, Brain, TrendingUp, Shield, Award } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: <Target className="h-6 w-6 text-indigo-600" />,
      title: '87% Average ATS Score',
      description: 'Our AI ensures your application beats 94% of other candidates with proven ATS optimization.',
      metric: '87/100',
      subtext: 'vs 62 industry average'
    }, 
    {
      icon: <Clock className="h-6 w-6 text-emerald-600" />,
      title: '38 Seconds to Perfect',
      description: 'From upload to tailored cover letter with ATS analysis - faster than making coffee.',
      metric: '38s',
      subtext: 'average generation time'
    }, 
    {
      icon: <Brain className="h-6 w-6 text-purple-600" />,
      title: 'Keyword Intelligence',
      description: 'Automatically matches 92% of job requirements using advanced NLP and real ATS data.',
      metric: '92%',
      subtext: 'keyword match rate'
    }, 
    {
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      title: 'Know Before You Apply',
      description: 'See exactly why you\'ll pass or fail ATS screening with detailed breakdowns and recommendations.',
      metric: '100%',
      subtext: 'transparency guarantee'
    }, 
    {
      icon: <Award className="h-6 w-6 text-amber-600" />,
      title: 'Human-Quality Writing',
      description: 'AI trained on 50,000+ successful cover letters that actually landed interviews.',
      metric: '50K+',
      subtext: 'training examples'
    },
    {
      icon: <Shield className="h-6 w-6 text-green-600" />,
      title: 'Your Data Stays Yours',
      description: 'GDPR compliant, encrypted, never shared or used for training. Complete privacy guaranteed.',
      metric: '100%',
      subtext: 'privacy protection'
    }
  ];
  
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            The Only Platform with Real-Time ATS Scoring
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Stop guessing if your application will make it past ATS filters. 
            Get instant, measurable results with our AI-powered analysis.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg w-14 h-14 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {feature.title}
                </h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">
                    {feature.metric}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {feature.subtext}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              
              {/* Progress bar for visual appeal */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full h-2 transition-all duration-1000"
                    style={{ 
                      width: index === 0 ? '87%' : 
                             index === 1 ? '95%' : 
                             index === 2 ? '92%' : 
                             index === 3 ? '100%' : 
                             index === 4 ? '98%' : '100%' 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Trusted by 12,847+ Job Seekers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">87%</div>
                <div className="text-gray-600">Average ATS Score</div>
                <div className="text-sm text-gray-500">vs 62% industry standard</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">3x</div>
                <div className="text-gray-600">More Interviews</div>
                <div className="text-sm text-gray-500">compared to manual applications</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">50K+</div>
                <div className="text-gray-600">Success Stories</div>
                <div className="text-sm text-gray-500">cover letters that landed jobs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 