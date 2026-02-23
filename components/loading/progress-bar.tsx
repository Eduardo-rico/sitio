"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  height?: "xs" | "sm" | "md" | "lg";
  color?: string;
  showLabel?: boolean;
  animated?: boolean;
  striped?: boolean;
}

const heights = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({
  progress,
  className = "",
  height = "md",
  color = "bg-blue-600",
  showLabel = false,
  animated = true,
  striped = false,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`w-full ${heights[height]} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={animated ? { duration: 0.5, ease: "easeOut" } : { duration: 0 }}
          className={`h-full ${color} rounded-full ${striped ? "progress-striped" : ""} ${
            animated ? "transition-all duration-300" : ""
          }`}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>Progreso</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}
    </div>
  );
}

// Indeterminate progress bar (loading state)
export function IndeterminateProgressBar({
  className = "",
  height = "md",
  color = "bg-blue-600",
}: Omit<ProgressBarProps, "progress" | "showLabel" | "animated" | "striped">) {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div
        className={`w-full ${heights[height]} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}
      >
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`h-full ${color} rounded-full w-1/3`}
        />
      </div>
    </div>
  );
}

// Circular progress
interface CircularProgressProps {
  progress: number;
  size?: "sm" | "md" | "lg" | "xl";
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showPercentage?: boolean;
  className?: string;
}

const circularSizes = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export function CircularProgress({
  progress,
  size = "md",
  strokeWidth = 4,
  color = "text-blue-600",
  bgColor = "text-gray-200 dark:text-gray-700",
  showPercentage = false,
  className = "",
}: CircularProgressProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const sizes = {
    sm: { svg: "w-8 h-8", text: "text-xs" },
    md: { svg: "w-12 h-12", text: "text-sm" },
    lg: { svg: "w-16 h-16", text: "text-base" },
    xl: { svg: "w-24 h-24", text: "text-xl" },
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        className={`${sizes[size].svg} -rotate-90 transform`}
        viewBox="0 0 100 100"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={bgColor}
        />
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={color}
        />
      </svg>
      {showPercentage && (
        <span className={`absolute inset-0 flex items-center justify-center ${sizes[size].text} font-semibold text-gray-700 dark:text-gray-300`}>
          {Math.round(clampedProgress)}%
        </span>
      )}
    </div>
  );
}

// Multi-step progress
interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function StepProgress({
  currentStep,
  totalSteps,
  labels,
  className = "",
}: StepProgressProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Progress bar background */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 rounded-full" />
        <motion.div
          className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Step indicators */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            const isPending = step > currentStep;

            return (
              <div key={step} className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.2 : 1,
                    backgroundColor: isCompleted || isCurrent ? "rgb(37 99 235)" : "rgb(229 231 235)",
                  }}
                  className={`w-4 h-4 rounded-full border-2 transition-colors duration-300 z-10 ${
                    isCompleted || isCurrent
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  }`}
                >
                  {isCompleted && (
                    <svg className="w-full h-full text-white p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </motion.div>
                {labels && labels[step - 1] && (
                  <span className={`mt-2 text-xs ${
                    isCurrent
                      ? "text-blue-600 font-medium"
                      : isCompleted
                      ? "text-gray-700 dark:text-gray-300"
                      : "text-gray-400 dark:text-gray-500"
                  }`}>
                    {labels[step - 1]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Auto-progress bar (increments automatically)
export function AutoProgressBar({
  duration = 5000,
  onComplete,
  className = "",
  height = "md",
  color = "bg-blue-600",
}: {
  duration?: number;
  onComplete?: () => void;
} & Omit<ProgressBarProps, "progress" | "showLabel" | "animated" | "striped">) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <ProgressBar
      progress={progress}
      height={height}
      color={color}
      className={className}
      animated={false}
    />
  );
}
