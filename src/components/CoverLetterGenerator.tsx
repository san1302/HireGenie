"use client";

import * as React from "react";
import { Button } from "./ui/button";
import { FileUpload } from "./ui/file-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Loader2, Copy, Download, RefreshCw } from "lucide-react";
import { useToast } from "./ui/use-toast";

export default function CoverLetterGenerator() {
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);
  const [resumeText, setResumeText] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  const [coverLetter, setCoverLetter] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("upload");
  const { toast } = useToast();

  const handleGenerate = async () => {
    // Validate inputs
    if (
      (activeTab === "upload" && !resumeFile) ||
      (activeTab === "text" && !resumeText)
    ) {
      toast({
        title: "Resume required",
        description: "Please upload your resume or enter resume text",
        variant: "destructive",
      });
      return;
    }

    if (!jobDescription) {
      toast({
        title: "Job description required",
        description: "Please enter the job description",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();

      if (activeTab === "upload" && resumeFile) {
        formData.append("resume_file", resumeFile);
      } else if (activeTab === "text") {
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
      setCoverLetter(data.coverLetter);

      toast({
        title: "Cover letter generated",
        description: "Your personalized cover letter is ready!",
      });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast({
        title: "Generation failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate cover letter",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    toast({
      title: "Copied to clipboard",
      description: "Cover letter copied to clipboard",
    });
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
    if (activeTab === "upload") {
      setResumeFile(null);
    } else {
      setResumeText("");
    }
    setJobDescription("");
  };

  return (
    <section className="py-16 bg-white" id="generator">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">
            Generate Your Cover Letter
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your resume and paste the job description to create a
            personalized cover letter in seconds
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Information</CardTitle>
                <CardDescription>
                  Upload your resume or paste your resume content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="upload">Upload Resume</TabsTrigger>
                    <TabsTrigger value="text">Enter Text</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="space-y-4">
                    <FileUpload
                      onFileChange={setResumeFile}
                      fileName={resumeFile?.name}
                      acceptedFileTypes=".pdf,.docx,.doc"
                      maxSizeMB={5}
                    />
                  </TabsContent>
                  <TabsContent value="text" className="space-y-4">
                    <Textarea
                      placeholder="Paste your resume content here..."
                      className="min-h-[200px]"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>
                  Paste the job description you're applying for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste the job description here..."
                  className="min-h-[200px]"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Cover Letter"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Output Section */}
          <div>
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Your Cover Letter</CardTitle>
                <CardDescription>
                  {coverLetter
                    ? "Your personalized cover letter"
                    : "Generated cover letter will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="bg-gray-50 rounded-md p-4 h-full min-h-[400px] overflow-auto">
                  {coverLetter ? (
                    <div className="whitespace-pre-wrap">{coverLetter}</div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      {isGenerating ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-8 w-8 animate-spin mb-2" />
                          <p>Generating your cover letter...</p>
                        </div>
                      ) : (
                        <p>Fill in your details and click Generate</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              {coverLetter && (
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
