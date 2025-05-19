"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, X, FileText } from "lucide-react";

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileChange: (file: File | null) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  className?: string;
  fileName?: string | null;
}

export function FileUpload({
  onFileChange,
  acceptedFileTypes = ".pdf,.docx,.doc",
  maxSizeMB = 5,
  className,
  fileName = null,
  ...props
}: FileUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }

    // Check file type
    const fileType = file.name.split(".").pop()?.toLowerCase();
    const acceptedTypes = acceptedFileTypes
      .split(",")
      .map((type) => type.trim().replace(".", "").toLowerCase());

    if (fileType && !acceptedTypes.includes(fileType)) {
      setError(`File type .${fileType} is not supported`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (validateFile(file)) {
          onFileChange(file);
        } else {
          onFileChange(null);
        }
      }
    },
    [onFileChange, maxSizeMB, acceptedFileTypes],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileChange(file);
      } else {
        onFileChange(null);
        // Reset the input
        if (inputRef.current) inputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onFileChange(null);
    setError(null);
    // Reset the input
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-md transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 bg-background hover:bg-gray-50",
          fileName ? "bg-gray-50" : "",
          className,
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={fileName ? undefined : handleButtonClick}
        role={fileName ? undefined : "button"}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept={acceptedFileTypes}
          {...props}
        />

        {fileName ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                {fileName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 rounded-full hover:bg-gray-200"
              aria-label="Remove file"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm font-medium text-gray-700">
              Drag & drop your resume here
            </p>
            <p className="text-xs text-gray-500">
              {acceptedFileTypes.replace(/\./g, "").toUpperCase()} files up to{" "}
              {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
