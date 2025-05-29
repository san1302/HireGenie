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
  RefreshCw,
  X
} from "lucide-react";
import { useToast } from "./ui/use-toast";

export default function CoverLetterGenerator() {
  const [activeTab, setActiveTab] = useState("upload");
  const [fileName, setFileName] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("Professional");
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileProcessing, setFileProcessing] = useState(false);
  const { toast } = useToast();

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file: File) => {
    setFileProcessing(true);
    setError("");
    
    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      setFileName("");
      setResumeFile(null);
      setFileProcessing(false);
      return;
    }
    
    // Check file type
    const validTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const validExtensions = ['.pdf', '.doc', '.docx'];
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError("Please upload a PDF or Word document");
      setFileName("");
      setResumeFile(null);
      setFileProcessing(false);
      return;
    }
    
    setFileName(file.name);
    setResumeFile(file);
    
    // Simulate brief processing time for better UX
    setTimeout(() => {
      setFileProcessing(false);
    }, 600);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const clearSelectedFile = () => {
    setFileName("");
    setResumeFile(null);
    setError("");
    
    // Reset the file input value
    const fileInput = document.getElementById("resume-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
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
    setFileProcessing(true);
    try {
      const formData = new FormData();

      if (activeTab === "upload" && resumeFile) {
        formData.append("resume_file", resumeFile);
      } else if (activeTab === "paste") {
        formData.append("resume_text", resumeText);
      }

      formData.append("job_description", jobDescription);
      formData.append("tone", tone);

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      setFileProcessing(false);
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
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragging 
                        ? "border-blue-500 bg-blue-50" 
                        : fileName 
                          ? "border-green-300 hover:border-green-400" 
                          : "border-gray-300 hover:border-indigo-500"
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input 
                      type="file" 
                      className="hidden" 
                      id="resume-upload" 
                      accept=".pdf,.doc,.docx" 
                      onChange={handleFileChange} 
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                      <Upload className={`h-10 w-10 mb-2 ${
                        isDragging ? "text-blue-500" : fileName ? "text-green-500" : "text-gray-400"
                      }`} />
                      <p className="text-sm text-gray-600 mb-1">
                        {isDragging 
                          ? "Drop your file here" 
                          : fileName 
                            ? fileName 
                            : "Upload your resume"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Drag & drop or click to browse • PDF, DOC, DOCX files up to 5MB
                      </p>
                      {!fileName && !isDragging && (
                        <button 
                          className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            document.getElementById("resume-upload")?.click();
                          }}
                          type="button"
                        >
                          Browse Files
                        </button>
                      )}
                    </label>
                    {fileName && !fileProcessing && (
                      <div className="mt-3 flex items-center justify-center">
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600 mr-2">
                            File selected
                          </span>
                        </div>
                        <button 
                          onClick={clearSelectedFile}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                          type="button"
                          aria-label="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {fileProcessing && (
                      <div className="mt-3 flex items-center justify-center">
                        <Loader className="h-4 w-4 text-blue-500 mr-1 animate-spin" />
                        <span className="text-sm text-blue-600">
                          Processing file...
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
                  <select className="ml-2 text-sm border-none bg-transparent text-gray-700 focus:ring-0" value={tone} onChange={(e) => setTone(e.target.value)}>
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
              
              {coverLetter && !isGenerating ? (
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
