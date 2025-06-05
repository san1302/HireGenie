import { Loader2 } from "lucide-react";
import Logo from "./logo";

interface LoadingProps {
  variant?: "default" | "minimal" | "dashboard";
  message?: string;
  fullScreen?: boolean;
  showMessage?: boolean;
}

export default function Loading({ 
  variant = "default", 
  message = "Loading...",
  fullScreen = true,
  showMessage = false
}: LoadingProps) {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
    : "flex items-center justify-center p-8";

  if (variant === "minimal") {
    return (
      <div className={containerClasses}>
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className={containerClasses}>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-1">Loading Dashboard</p>
            <p className="text-sm text-gray-500">Preparing your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  // Default variant - Clean logo-centric design
  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          {/* Spinning ring around logo */}
          <div className="absolute inset-0 w-20 h-20 border-4 border-blue-600/20 rounded-full"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          
          {/* Center logo */}
          <div className="flex items-center justify-center w-20 h-20">
            <Logo size="md" showText={false} href="" className="scale-90" />
          </div>
        </div>
        
        {/* Optional message */}
        {showMessage && (
          <div className="text-center">
            <p className="text-gray-600">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
} 