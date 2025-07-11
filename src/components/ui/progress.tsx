import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "../../lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

// Enhanced Progress with status and animation
interface EnhancedProgressProps {
  value: number;
  status: string;
  className?: string;
  showPercentage?: boolean;
}

const EnhancedProgress = React.forwardRef<
  HTMLDivElement,
  EnhancedProgressProps
>(({ value, status, className, showPercentage = true, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props}>
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600 font-medium">{status}</span>
      {showPercentage && (
        <span className="text-blue-600 font-semibold">{Math.round(value)}%</span>
      )}
    </div>
    <Progress value={value} className="h-3" />
  </div>
));
EnhancedProgress.displayName = "EnhancedProgress";

export { Progress, EnhancedProgress };
