import React from 'react';
import { 
  Upload, 
  FileText, 
  Settings, 
  Check, 
  Loader, 
  AlertCircle,
  X,
  Sparkles
} from "lucide-react";
import { MobileStep, ActiveTab } from './types';

interface MobileWizardProps {
  // State
  mobileStep: MobileStep;
  currentStepIndex: number;
  activeTab: ActiveTab;
  resumeFile: File | null;
  fileName: string;
  resumeText: string;
  jobDescription: string;
  tone: string;
  length: string;
  outputFormat: string;
  error: string;
  isDragging: boolean;
  fileProcessing: boolean;
  isGenerating: boolean;
  
  // Handlers
  setActiveTab: (tab: ActiveTab) => void;
  setResumeText: (text: string) => void;
  setJobDescription: (text: string) => void;
  setTone: (tone: string) => void;
  setLength: (length: string) => void;
  setOutputFormat: (format: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  clearSelectedFile: () => void;
  handleGenerate: () => void;
  nextMobileStep: () => void;
  prevMobileStep: () => void;
  canProceedFromStep: (step: string) => boolean;
}

const mobileSteps = [
  { id: 'resume', title: 'Resume', icon: Upload },
  { id: 'job', title: 'Job Details', icon: FileText },
  { id: 'customize', title: 'Customize', icon: Settings },
  { id: 'generate', title: 'Generate', icon: Sparkles }
];

export const MobileWizard: React.FC<MobileWizardProps> = ({
  mobileStep,
  currentStepIndex,
  activeTab,
  resumeFile,
  fileName,
  resumeText,
  jobDescription,
  tone,
  length,
  outputFormat,
  error,
  isDragging,
  fileProcessing,
  isGenerating,
  setActiveTab,
  setResumeText,
  setJobDescription,
  setTone,
  setLength,
  setOutputFormat,
  handleFileChange,
  handleDragEnter,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  clearSelectedFile,
  handleGenerate,
  nextMobileStep,
  prevMobileStep,
  canProceedFromStep
}) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-200 mx-auto overflow-hidden">
    {/* Progress Bar */}
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">
          Step {currentStepIndex + 1} of {mobileSteps.length}
        </h3>
        <span className="text-xs text-gray-500">
          {Math.round(((currentStepIndex + 1) / mobileSteps.length) * 100)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStepIndex + 1) / mobileSteps.length) * 100}%` }}
        ></div>
      </div>
    </div>

    {/* Step Content */}
    <div className="p-4">
      {mobileStep === 'resume' && (
        <div>
          <div className="text-center mb-4">
            <Upload className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Your Resume</h3>
            <p className="text-sm text-gray-600">Choose how you'd like to provide your resume</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex space-x-1 border-b border-gray-200 mb-4">
              <button 
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === "upload" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500"}`} 
                onClick={() => setActiveTab("upload")}
              >
                Upload File
              </button>
              <button 
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === "paste" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500"}`} 
                onClick={() => setActiveTab("paste")}
              >
                Paste Text
              </button>
            </div>
            
            {activeTab === "upload" ? (
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
                  ? "border-blue-500 bg-blue-50" 
                  : fileName 
                  ? "border-green-300 bg-green-50" 
                  : "border-gray-300"
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  id="mobile-resume-upload" 
                  accept=".pdf,.doc,.docx" 
                  onChange={handleFileChange} 
                />
                <label htmlFor="mobile-resume-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className={`h-10 w-10 mb-3 ${isDragging ? "text-blue-500" : fileName ? "text-green-500" : "text-gray-400"}`} />
                  <p className="text-base text-gray-600 mb-2 font-medium">
                    {isDragging 
                      ? "Drop your file here" 
                      : fileName 
                        ? fileName 
                        : "Upload your resume"}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    PDF, DOC, DOCX files up to 5MB
                  </p>
                  {!fileName && !isDragging && (
                    <button 
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        document.getElementById("mobile-resume-upload")?.click();
                      }}
                      type="button"
                    >
                      Choose File
                    </button>
                  )}
                </label>
                {fileName && !fileProcessing && (
                  <div className="mt-3 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm text-green-600 mr-3">File selected</span>
                    <button 
                      onClick={clearSelectedFile}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {fileProcessing && (
                  <div className="mt-3 flex items-center justify-center">
                    <Loader className="h-4 w-4 text-blue-500 mr-2 animate-spin" />
                    <span className="text-sm text-blue-600">Processing...</span>
                  </div>
                )}
              </div>
            ) : (
              <textarea 
                className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm" 
                placeholder="Paste your resume content here..." 
                value={resumeText} 
                onChange={(e) => setResumeText(e.target.value)}
              />
            )}
          </div>
        </div>
      )}
      
      {mobileStep === 'job' && (
        <div>
          <div className="text-center mb-4">
            <FileText className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Job Description</h3>
            <p className="text-sm text-gray-600">Paste the job posting you're applying for</p>
          </div>
          <textarea 
            className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm" 
            placeholder="Paste the complete job description here..." 
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <div className="mt-2 text-xs text-gray-500">
            {jobDescription.length} characters • Include requirements, responsibilities, and company info
          </div>
        </div>
      )}

      {mobileStep === 'customize' && (
        <div>
          <div className="text-center mb-4">
            <Settings className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Customize Your Letter</h3>
            <p className="text-sm text-gray-600">Choose tone, length, and format</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <select 
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-3 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                value={tone} 
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="Professional">Professional</option>
                <option value="Conversational">Conversational</option>
                <option value="Enthusiastic">Enthusiastic</option>
                <option value="Formal">Formal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Length
              </label>
              <select 
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-3 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                value={length} 
                onChange={(e) => setLength(e.target.value)}
              >
                <option value="Concise">Concise (2-3 paragraphs)</option>
                <option value="Standard">Standard (3-4 paragraphs)</option>
                <option value="Detailed">Detailed (4-5 paragraphs)</option>
                <option value="Comprehensive">Comprehensive (5+ paragraphs)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Download Format
              </label>
              <select 
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-3 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                value={outputFormat} 
                onChange={(e) => setOutputFormat(e.target.value)}
              >
                <option value="txt">Plain Text (.txt)</option>
                <option value="html">HTML Document (.html)</option>
                <option value="docx">Word Compatible (.rtf)</option>
                <option value="pdf">PDF (Print to Save)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {mobileStep === 'generate' && (
        <div>
          <div className="text-center mb-6">
            <Sparkles className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Ready to Generate</h3>
            <p className="text-sm text-gray-600">Review your settings and create your cover letter</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Resume:</span>
              <span className="text-gray-900 font-medium">
                {fileName || (resumeText ? 'Pasted text' : 'Not provided')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Job description:</span>
              <span className="text-gray-900 font-medium">
                {jobDescription ? `${jobDescription.length} characters` : 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tone:</span>
              <span className="text-gray-900 font-medium">{tone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Length:</span>
              <span className="text-gray-900 font-medium">{length}</span>
            </div>
          </div>

          <button 
            className={`w-full px-4 py-4 bg-indigo-600 text-white rounded-lg transition-colors flex items-center justify-center text-base font-medium ${isGenerating ? "opacity-75 cursor-not-allowed" : "hover:bg-indigo-700"}`} 
            onClick={handleGenerate} 
            disabled={isGenerating || !canProceedFromStep('job')}
          >
            {isGenerating ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Cover Letter
              </>
            )}
          </button>
        </div>
      )}
    </div>
    
    {/* Navigation */}
    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between">
      <button 
        onClick={prevMobileStep}
        disabled={currentStepIndex === 0}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentStepIndex === 0
          ? 'text-gray-400 cursor-not-allowed' 
          : 'text-gray-700 hover:bg-gray-200'
        }`}
      >
        Previous
      </button>
      
      {currentStepIndex < mobileSteps.length - 1 && (
        <button 
          onClick={nextMobileStep}
          disabled={!canProceedFromStep(mobileStep)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${!canProceedFromStep(mobileStep)
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Next
        </button>
      )}
    </div>
  </div>
); 