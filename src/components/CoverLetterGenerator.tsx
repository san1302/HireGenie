"use client";

import React, { useState } from "react";
import { 
  Upload, 
  FileText, 
  Settings, 
  Check, 
  Loader, 
  Copy, 
  Download,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useToast } from "./ui/use-toast";

export default function CoverLetterGenerator() {
  const [activeTab, setActiveTab] = useState("upload");
  const [fileName, setFileName] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        setFileName("");
        setResumeFile(null);
        return;
      }
      setFileName(file.name);
      setResumeFile(file);
      setError("");
    }
  };

  const validateForm = () => {
    if (activeTab === "upload" && !resumeFile) {
      setError("Please upload your resume");
      return false;
    }
    
    if (activeTab === "paste" && !resumeText.trim()) {
      setError("Please paste your resume content");
      return false;
    }
    
    if (!jobDescription.trim()) {
      setError("Please provide the job description");
      return false;
    }
    
    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;
    
    setIsGenerating(true);
    setError("");
    
    try {
      const formData = new FormData();

      if (activeTab === "upload" && resumeFile) {
        formData.append("resume_file", resumeFile);
      } else if (activeTab === "paste") {
        formData.append("resume_text", resumeText);
      }

      formData.append("job_description", jobDescription);

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate cover letter");
      }

      const data = await response.json();
      setCoverLetter(data.coverLetter || sampleCoverLetter);
      
      toast({
        title: "Cover letter generated",
        description: "Your personalized cover letter is ready!",
      });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      setError(error instanceof Error ? error.message : "Failed to generate cover letter");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Cover letter copied to clipboard",
      });
    } catch (err) {
      setError("Failed to copy text");
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([coverLetter], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "cover-letter.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleReset = () => {
    setCoverLetter("");
    setResumeFile(null);
    setFileName("");
    setResumeText("");
    setJobDescription("");
  };

  // Sample cover letter for the UI
  const sampleCoverLetter = `Dear Hiring Manager,

I am writing to express my interest in the Senior Software Engineer position at Acme Inc. With over 5 years of experience in React and Node.js development, I am confident in my ability to become a valuable member of your team.

Throughout my career, I have focused on building scalable web applications and implementing best practices in software development. My experience aligns perfectly with the requirements outlined in your job description, particularly in frontend development and API integration.

At my previous role at XYZ Company, I led the development of a customer-facing portal that improved user engagement by 40%. I collaborated closely with design and product teams to ensure seamless integration of features while maintaining code quality and performance.

I am particularly excited about the opportunity to work on innovative projects at Acme Inc. Your company's commitment to technological advancement and user-centered design resonates with my professional values.

I would welcome the opportunity to discuss how my background, skills, and experiences would benefit your team. Thank you for considering my application.

Sincerely,
John Smith`;

  return (
    <section id="cover-letter-tool" className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Generate Your Cover Letter
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your resume and paste the job description to create a
            personalized cover letter in seconds
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-5xl mx-auto overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left Side - Input */}
            <div className="md:w-1/2 p-6 md:border-r border-gray-200">
              <div className="mb-6">
                <div className="flex space-x-4 border-b border-gray-200">
                  <button 
                    className={`pb-2 px-1 ${activeTab === "upload" ? "border-b-2 border-indigo-600 text-indigo-600 font-medium" : "text-gray-500"}`} 
                    onClick={() => setActiveTab("upload")}
                  >
                    Resume Upload
                  </button>
                  <button 
                    className={`pb-2 px-1 ${activeTab === "paste" ? "border-b-2 border-indigo-600 text-indigo-600 font-medium" : "text-gray-500"}`} 
                    onClick={() => setActiveTab("paste")}
                  >
                    Paste Resume
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              {activeTab === "upload" ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Resume
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                    <input 
                      type="file" 
                      className="hidden" 
                      id="resume-upload" 
                      accept=".pdf,.doc,.docx" 
                      onChange={handleFileChange} 
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        {fileName ? fileName : "Drag & drop your resume here"}
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX files up to 5MB
                      </p>
                      {!fileName && (
                        <button className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
                          Browse Files
                        </button>
                      )}
                    </label>
                    {fileName && (
                      <div className="mt-3 flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">
                          File uploaded
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste Resume Content
                  </label>
                  <textarea 
                    className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" 
                    placeholder="Paste your resume content here..." 
                    value={resumeText} 
                    onChange={(e) => setResumeText(e.target.value)}
                  ></textarea>
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea 
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" 
                  placeholder="Paste the job description you're applying for..." 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Tone:</span>
                  <select className="ml-2 text-sm border-none bg-transparent text-gray-700 focus:ring-0">
                    <option>Professional</option>
                    <option>Conversational</option>
                    <option>Enthusiastic</option>
                    <option>Formal</option>
                  </select>
                </div>
                <button 
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-lg transition-colors flex items-center ${isGenerating ? "opacity-75 cursor-not-allowed" : "hover:bg-indigo-700"}`} 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Generating...
                    </>
                  ) : "Generate Letter"}
                </button>
              </div>
            </div>
            
            {/* Right Side - Output */}
            <div className="md:w-1/2 p-6 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Your Cover Letter
              </h3>
              
              {coverLetter ? (
                <>
                  <div className="bg-white border border-gray-200 rounded-lg p-5 h-[400px] overflow-y-auto cover-letter-content">
                    <div className="whitespace-pre-wrap text-gray-700">{coverLetter}</div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <button 
                      className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
                      onClick={handleReset}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reset
                    </button>
                    <div className="flex space-x-3">
                      <button 
                        onClick={handleCopy} 
                        className="px-3 py-1 text-sm border border-gray-200 rounded hover:border-gray-300 text-gray-600 flex items-center"
                      >
                        {copySuccess ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                        {copySuccess ? "Copied!" : "Copy"}
                      </button>
                      <button 
                        onClick={handleDownload} 
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white border border-gray-200 border-dashed rounded-lg p-8 h-[400px] flex flex-col items-center justify-center text-center">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  {isGenerating ? (
                    <>
                      <Loader className="h-8 w-8 animate-spin mb-2 text-indigo-500" />
                      <p className="text-gray-500 mb-2">
                        Generating your cover letter...
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-500 mb-2">
                        Your generated cover letter will appear here
                      </p>
                      <p className="text-sm text-gray-400">
                        Fill in your resume and job description, then click
                        "Generate Letter"
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
